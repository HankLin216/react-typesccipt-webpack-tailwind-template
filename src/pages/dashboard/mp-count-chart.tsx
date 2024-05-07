import React, { useState, useEffect, useRef } from 'react'
import * as Highcharts from 'highcharts'
import loadingGif from '../../assets/gif/Walk.gif'
import moment from 'moment'
import HighchartsReact, { type HighchartsReactRefObject } from 'highcharts-react-official'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Yaya12085Button from '../../components/button/yaya12085-button'
import type { ITimeRange } from '../../types/time'

const baseUrl = 'http://192.168.197.93:9001/v1'

interface IMPCountOfIC {
  ic: string
  categories: string[]
  data: number[]
}

interface IMPCountChartData {
  MPCountOfICByWeeks: IMPCountOfIC[]
}

interface IMPLogRequest {
  beginAt: moment.Moment
  endAt: moment.Moment
}

interface IMPLogResponse {
  mpLogs: IMPLog[]
}

interface IMPLog {
  mpLogId: string
  pjId: string
  actionMode: number
  whatsMpDlmcEnable: string
  tkId: string
  testerName: string
  ic: string
  fwVersion: string
  fwSubVersion: string
  userRealName: string
  forceMp: boolean
  mpEnvironment: number
  mpResult: number
  mpErrorCode: string
  memo: string
  startAt: string
  endAt: string
}

const buildWeeks = (startAt: moment.Moment, endAt: moment.Moment): string[] => {
  const weeks: string[] = []
  while (startAt.isBefore(endAt)) {
    const week = `${startAt.weekYear()}-${startAt.week()}w`
    weeks.push(week)
    startAt = startAt.clone().add(1, 'week')
  }

  return weeks
}

const getMPCountChartOptions = (data: IMPCountChartData): Highcharts.Options => {
  // get any category
  let keys: string[] = []
  if (data.MPCountOfICByWeeks.length > 0) {
    keys = data.MPCountOfICByWeeks[0].categories
  }

  const mpCountOfICs: Highcharts.SeriesColumnOptions[] = []

  // convert data to series
  for (const a of data.MPCountOfICByWeeks) {
    mpCountOfICs.push({
      type: 'column',
      name: a.ic,
      yAxis: 0,
      data: a.data,
    })
  }

  return {
    chart: {
      type: 'column',
    },
    title: {
      text: 'MP Count of ICs by Weeks',
    },
    loading: {
      labelStyle: {
        display: 'none',
      },
      style: {
        backgroundImage: `url(${loadingGif})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '50px 50px',
      },
    },
    xAxis: [
      {
        categories: keys,
        title: {
          text: 'Weeks of the year',
        },
      },
    ],
    yAxis: [
      {
        title: {
          text: 'MP Count',
        },
        stackLabels: {
          enabled: true,
        },
      },
    ],
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [...mpCountOfICs],
  }
}

function processMPLogs(data: IMPLog[], timeRange: ITimeRange): IMPCountOfIC[] {
  const ret: IMPCountOfIC[] = []

  const weeks = buildWeeks(timeRange.startAt.clone(), timeRange.endAt.clone())
  const icMap = new Map<string, IMPCountOfIC>()

  data.forEach((d) => {
    const ic = d.ic
    if (ic !== 'PS5302' && ic !== 'PS5027' && !d.fwVersion.startsWith('VADL')) {
      return
    }

    const startAt = moment(d.startAt)
    const key = `${startAt.weekYear()}-${startAt.week()}w`

    let icData = icMap.get(ic)
    if (icData === undefined) {
      icData = {
        ic,
        categories: weeks,
        data: Array(weeks.length).fill(0),
      }
      icMap.set(ic, icData)
    }

    const idx = icData.categories.indexOf(key)
    if (idx === -1) {
      icData.categories.push(key)
      icData.data.push(1)
    } else {
      icData.data[idx] += 1
    }
  })

  icMap.forEach((v) => {
    ret.push(v)
  })

  return ret
}

async function getRawMPLogs(req: IMPLogRequest): Promise<IMPLogResponse> {
  const res = await fetch(`${baseUrl}/mp_logs`, {
    method: 'POST',
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

const asyncFetchData = async (range: ITimeRange): Promise<IMPCountChartData> => {
  const ret: IMPCountChartData = {
    MPCountOfICByWeeks: [],
  }

  try {
    const req: IMPLogRequest = {
      beginAt: range.startAt,
      endAt: range.endAt,
    }
    const mplogs = await getRawMPLogs(req)
    ret.MPCountOfICByWeeks = processMPLogs(mplogs.mpLogs, range)
  } catch (e) {
    console.error(e)
  }

  return ret
}

const MpCountChart = (): JSX.Element => {
  const [mpCountChartData, setMPCountChartData] = useState<IMPCountChartData>({
    MPCountOfICByWeeks: [],
  })
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(
    moment().add(-1, 'days').startOf('day').clone().hours(0).minutes(0).seconds(0).milliseconds(0)
  )
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(moment())

  const chartRef = useRef<HighchartsReactRefObject | null>(null)

  const options = getMPCountChartOptions(mpCountChartData)

  // fetch data effect at first
  useEffect(() => {
    if (startDateTime === null || endDateTime === null) {
      return
    }

    const range: ITimeRange = {
      startAt: startDateTime,
      endAt: endDateTime,
    }

    if (chartRef.current !== null) {
      chartRef.current.chart.showLoading()
    }

    asyncFetchData(range)
      .then((data) => {
        setMPCountChartData(data)
        console.log('fetch data at init success')
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        if (chartRef.current !== null) {
          chartRef.current.chart.hideLoading()
        }
      })
  }, [])

  // click button event
  const handleButtonClick = (): void => {
    if (startDateTime === null || endDateTime === null) {
      return
    }

    // get the current time range
    const range: ITimeRange = {
      startAt: startDateTime,
      endAt: endDateTime,
    }

    if (range.startAt.isSame(range.endAt) && range.endAt.isSame(range.endAt)) {
      return
    }

    if (chartRef.current !== null) {
      chartRef.current.chart.showLoading()
    }

    asyncFetchData(range)
      .then((data) => {
        setMPCountChartData(data)
        console.log('fetch data by button success')
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        if (chartRef.current !== null) {
          chartRef.current.chart.hideLoading()
        }
      })
  }

  return (
    <div>
      <h1 className="mb-8 font-bold">MP Count Chart</h1>
      <div className="grid grid-cols-3 gap-1">
        {/* plot */}
        <div className="col-span-2">
          {/* tool menu */}
          <div className="grid grid-cols-12 gap-1 mb-5">
            {/* date time picker */}
            <div className="col-span-2 text-center self-center">Time From:</div>
            <div className="col-span-3">
              <DateTimePicker
                label="Start At"
                slotProps={{ textField: { size: 'small' } }}
                value={startDateTime}
                onChange={(newDateTime) => {
                  setStartDateTime(newDateTime)
                }}
              />
            </div>
            <div className="text-center self-center">To</div>
            <div className="col-span-3">
              <DateTimePicker
                label="End At"
                slotProps={{ textField: { size: 'small' } }}
                value={endDateTime}
                onChange={(newDateTime) => {
                  setEndDateTime(newDateTime)
                }}
              />
            </div>
            <div></div>
            <div className="col-span-2">
              <Yaya12085Button text="Boom!" onClick={handleButtonClick} />
            </div>
          </div>
          {/* chart */}
          <div>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
          </div>
        </div>
        {/* description */}
        <div className="col-span-1">
          <div className="p-2">Desc...</div>
        </div>
      </div>
    </div>
  )
}

export default MpCountChart
