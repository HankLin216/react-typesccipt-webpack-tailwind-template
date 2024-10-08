import React, { useState, useEffect, useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact, { type HighchartsReactRefObject } from 'highcharts-react-official'
import moment from 'moment'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Yaya12085Button from '../../../components/button/yaya12085-button'
import loadingGif from '../../../assets/gif/Walk.gif'
import { splitTimeRange } from '../../../utils/time'
import type { ITimeRange } from '../../../types/time'

// interface
interface ISwtichToolLogRequest extends ITimeRange {}

interface ISwtichToolLogResponse {
  switchToolLogsDetail: ISwtichToolLogDetail[]
}

interface ISwtichToolLogDetail {
  message: string
  testerName: string
  currentTool: string
  taskId: string
  projectId: string
  productId: string
  icId: string
  ic: string
  timestamp: string
}

interface IListProjectProgressRequest extends ITimeRange {
  actionMode: number
  progressThreshold: number
}

interface IListProjectProgressResponse {
  projectProgress: IProjectProgress[]
}

interface IProjectProgress {
  pjId: string
  ic: string
  progress: string
  establishDate: string
  duration: string
}

interface ISwtichToolAmountOfIC {
  ic: string
  categories: string[]
  data: number[]
}

interface IAveOfProjectProgressOfIC {
  ic: string
  categories: string[]
  data: number[]
  rawData: number[][]
}

interface ISwitchToolAmountChartData {
  amountOfICByWeeks: ISwtichToolAmountOfIC[]
  aveProjectProgressOfICByWeeks: IAveOfProjectProgressOfIC[]
}

// function
const buildWeeks = (startAt: moment.Moment, endAt: moment.Moment): string[] => {
  const weeks: string[] = []
  while (startAt.isBefore(endAt)) {
    const week = `${startAt.weekYear()}-${startAt.week()}w`
    weeks.push(week)
    startAt = startAt.clone().add(1, 'week')
  }

  return weeks
}

const processRawSwtichToolLogs = (data: ISwtichToolLogDetail[], timeRange: ITimeRange, objectIc?: string[]): ISwtichToolAmountOfIC[] => {
  // get all objectIc from data
  if (objectIc === undefined) {
    const icSet = new Set<string>()
    for (const log of data) {
      icSet.add(log.ic)
    }

    objectIc = Array.from(icSet)
  }

  // init ret
  const ret: ISwtichToolAmountOfIC[] = []
  const weeks = buildWeeks(timeRange.startAt.clone(), timeRange.endAt.clone())

  for (const ic of objectIc) {
    const data = Array(weeks.length).fill(0)
    ret.push({
      ic,
      data,
      categories: weeks,
    })
  }

  for (const log of data) {
    if (!objectIc.includes(log.ic)) {
      continue
    }

    // get the index of weeks
    const week = `${moment(log.timestamp).weekYear()}-${moment(log.timestamp).week()}w`
    const index = weeks.indexOf(week)

    if (index === -1) {
      continue
    }

    // fill the data of ic in the ret
    ret.find((r) => {
      if (r.ic === log.ic) {
        r.data[index]++
        return true
      }

      return false
    })
  }

  return ret
}

const processRawProjectProgress = (data: IProjectProgress[], timeRange: ITimeRange, objectIc?: string[]): IAveOfProjectProgressOfIC[] => {
  // get all objectIc from data
  if (objectIc === undefined) {
    const icSet = new Set<string>()
    for (const log of data) {
      icSet.add(log.ic)
    }

    objectIc = Array.from(icSet)
  }

  // init ret
  const ret: IAveOfProjectProgressOfIC[] = []
  const weeks = buildWeeks(timeRange.startAt.clone(), timeRange.endAt.clone())

  for (const ic of objectIc) {
    const data = Array(weeks.length).fill(0)
    ret.push({
      ic,
      data,
      categories: weeks,
      rawData: weeks.map(() => []),
    })
  }

  for (const p of data) {
    if (!objectIc.includes(p.ic)) {
      continue
    }

    const week = `${moment(p.establishDate).weekYear()}-${moment(p.establishDate).week()}w`
    const index = weeks.indexOf(week)
    if (index === -1) {
      continue
    }

    // skip 0
    const h = moment.duration('PT' + p.duration.toUpperCase()).asHours()
    if (h === 0) {
      continue
    }

    ret.find((r) => {
      if (r.ic === p.ic) {
        r.rawData[index].push(h)
        return true
      }

      return false
    })
  }

  // compute average
  for (const r of ret) {
    for (let i = 0; i < r.rawData.length; i++) {
      const rawArray = r.rawData[i]
      const sum = rawArray.reduce((a, b) => a + b, 0)
      r.data[i] = sum / rawArray.length
    }
  }

  return ret
}

const getAmountOfSwitchToolChartOptions = (data: ISwitchToolAmountChartData): Highcharts.Options => {
  // get any category
  let keys: string[] = []
  if (data.amountOfICByWeeks.length > 0) {
    keys = data.amountOfICByWeeks[0].categories
  }

  const amountOfICs: Highcharts.SeriesColumnOptions[] = []
  const aveOfProjectProgressForEachIc: Highcharts.SeriesSplineOptions[] = []

  // convert data to series
  for (const a of data.amountOfICByWeeks) {
    amountOfICs.push({
      type: 'column',
      name: a.ic,
      yAxis: 0,
      data: a.data,
    })
  }

  for (const av of data.aveProjectProgressOfICByWeeks) {
    aveOfProjectProgressForEachIc.push({
      name: `${av.ic} project progress`,
      type: 'spline',
      yAxis: 1,
      data: av.data,
      marker: {
        enabled: false,
      },
      dashStyle: 'ShortDot',
    })
  }

  return {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Switch Tool Amount vs Project Progress',
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
          text: 'Switch Amount',
        },
      },
      {
        title: {
          text: 'Project Progress, Average hours spent in hours',
        },
        opposite: true,
      },
    ],
    plotOptions: {
      column: {
        stacking: 'normal',
      },
    },
    series: [...amountOfICs, ...aveOfProjectProgressForEachIc],
  }
}

// async function
async function getRawSwtichToolLogs(req: ISwtichToolLogRequest): Promise<ISwtichToolLogResponse> {
  const res = await fetch(`${process.env.TIC_BASE_URL}/switch_tool_log_detail`, {
    method: 'POST',
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

async function getRawListProjectProgress(req: IListProjectProgressRequest): Promise<IListProjectProgressResponse> {
  const res = await fetch(`${process.env.TIC_BASE_URL}/project/progress`, {
    method: 'POST',
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

const asyncFetchData = async (range: ITimeRange): Promise<ISwitchToolAmountChartData> => {
  // split time range into parts that each part is 10 days
  const timeRanges: ITimeRange[] = splitTimeRange(range, 10)

  const ret: ISwitchToolAmountChartData = {
    amountOfICByWeeks: [],
    aveProjectProgressOfICByWeeks: [],
  }

  try {
    const logRequests: Array<Promise<ISwtichToolLogResponse>> = []
    const progressRequests: Array<Promise<IListProjectProgressResponse>> = []
    for (const req of timeRanges) {
      // get switch tool logs
      const p = getRawSwtichToolLogs(req)

      const pReq = {
        startAt: req.startAt,
        endAt: req.endAt,
        actionMode: 6,
        progressThreshold: 70,
      }

      // get project progress
      const pp = getRawListProjectProgress(pReq)
      logRequests.push(p)
      progressRequests.push(pp)
    }

    // await all fetch
    const allLogs: ISwtichToolLogDetail[] = []
    const logRess = await Promise.all(logRequests)
    for (const res of logRess) {
      allLogs.push(...res.switchToolLogsDetail)
    }

    const allProgress: IProjectProgress[] = []
    const progressRess = await Promise.all(progressRequests)
    for (const res of progressRess) {
      allProgress.push(...res.projectProgress)
    }

    // process raw data
    const objectIc = ['PS5021', 'PS5022', 'PS5025', 'PS5026', 'PS5027']
    const pLogs = processRawSwtichToolLogs(allLogs, range, objectIc)
    const pProgress = processRawProjectProgress(allProgress, range, objectIc)

    ret.amountOfICByWeeks = pLogs
    ret.aveProjectProgressOfICByWeeks = pProgress
  } catch (error) {
    console.error(error)
  }
  return ret
}

// components
const SwitchToolAmountChart = (): JSX.Element => {
  const [switchToolAmountChartData, setSwitchToolAmountChartData] = useState<ISwitchToolAmountChartData>({
    amountOfICByWeeks: [],
    aveProjectProgressOfICByWeeks: [],
  })
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(
    moment().add(-1, 'days').startOf('day').clone().hours(0).minutes(0).seconds(0).milliseconds(0)
  )
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(moment())

  const chartRef = useRef<HighchartsReactRefObject | null>(null)

  const options = getAmountOfSwitchToolChartOptions(switchToolAmountChartData)

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
        setSwitchToolAmountChartData(data)
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
        setSwitchToolAmountChartData(data)
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
      <h1 className="mb-8 font-bold">Switch Tool Amount Chart</h1>
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

export default SwitchToolAmountChart
