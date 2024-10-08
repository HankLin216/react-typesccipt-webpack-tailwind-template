import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { splitTimeRange } from '../../../utils/time'
import type { ITimeRange } from '../../../types/time'
import * as Highcharts from 'highcharts'
import HighchartsReact, { type HighchartsReactRefObject } from 'highcharts-react-official'
import CatracoButton from '../../../components/button/catraco'
import loadingGif from '../../../assets/gif/Ghost.gif'

interface IPPS2MultiSinglePortLogRequest extends ITimeRange {}

interface IPPS2MultiSinglePortLogResponse {
  multiSinglePortLogsDetail: IPPS2MultiSinglePortLogDetail[]
}

interface IPPS2MultiSinglePortLogDetail {
  message: string
  normalSampleCount: string
  serverPort: string
  pps2MultiSinglePortSampleIds: string[]
  pps2MultiSinglePortSamples: IPPS2MultiSinglePortSample[]
  timestamp: string
}

interface IPPS2MultiSinglePortSample {
  id: string
  fw: string
  ic: string
  ctrlId: string
  ip: string
}

interface IPieChartData {
  envCount: IPieSubData[]
  multiIcCount: IPieSubData[]
  multiFwCount: IPieSubData[]
}

interface IPieSubData {
  name: string
  value: number
}

// property
const icByfw: Record<string, string> = {}
const colorByIc: Record<string, string | Highcharts.GradientColorObject | Highcharts.PatternObject> = {}

// async function
const getRawPPS2MultiSinglePortLogs = async (req: IPPS2MultiSinglePortLogRequest): Promise<IPPS2MultiSinglePortLogResponse> => {
  const url = `${process.env.TIC_BASE_URL}/multi_single_port_log_detail`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  const data = await res.json()
  return data
}

const asyncFetchData = async (range: ITimeRange): Promise<IPieChartData> => {
  // split time range into parts that each part is n days
  const timeRanges: ITimeRange[] = splitTimeRange(range, 3)

  const ret: IPieChartData = {
    envCount: [],
    multiIcCount: [],
    multiFwCount: [],
  }

  const logRequests: Array<Promise<IPPS2MultiSinglePortLogResponse>> = []
  timeRanges.forEach((timeRange) => {
    // get logs
    logRequests.push(getRawPPS2MultiSinglePortLogs(timeRange))
  })

  // await all fetch
  const allress = await Promise.all(logRequests)
  const allLogs: IPPS2MultiSinglePortLogDetail[] = []
  for (const res of allress) {
    allLogs.push(...res.multiSinglePortLogsDetail)
  }

  // process data
  processEnvCount(allLogs, ret)
  processMultiIcFwCount(allLogs, ret)

  return ret
}

// function
const getEnvCountChartOptions = (data: IPieChartData): Highcharts.Options => {
  const envData: Highcharts.PointOptionsObject[] = []

  for (const d of data.envCount) {
    envData.push({
      name: d.name,
      sliced: d.name !== 'Normal env',
      y: d.value,
    })
  }

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: 'PPS2 Multi Single Port Count vs Normal Env Count',
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
  }

  if (envData.length === 0) {
    return options
  }

  options.series = [
    {
      type: 'pie',
      name: 'Ave. Count',
      data: envData,
      dataLabels: {
        enabled: true,
        format: `<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)`,
      },
    },
  ]

  return options
}

const getIcWithFwCountChartOptions = (data: IPieChartData): Highcharts.Options => {
  const icData: Highcharts.PointOptionsObject[] = []
  const fwData: Highcharts.PointOptionsObject[] = []

  for (const d of data.multiIcCount) {
    // get ic color
    icData.push({
      name: d.name,
      y: d.value,
      color: colorByIc[d.name],
    })
  }

  for (const d of data.multiFwCount) {
    // get the ic
    const ic = icByfw[d.name]

    // get the total count of the ic
    let total = 0
    for (const icd of data.multiIcCount) {
      if (icd.name === ic) {
        total = icd.value
        break
      }
    }

    // get the percentage
    const brightness = 0.2 - d.value / total / 6

    fwData.push({
      name: d.name,
      y: d.value,
      color: Highcharts.color(colorByIc[ic]).brighten(brightness).get(),
    })
  }

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
    },
    title: {
      text: 'Multi Single Port Count of Each IC',
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
  }

  if (icData.length === 0) {
    return options
  }

  options.series = [
    {
      type: 'pie',
      name: 'IC Ave. Count',
      data: icData,
      size: '45%',
      dataLabels: {
        color: '#ffffff',
        distance: '-50%',
        format: `<b>{point.name}</b>({point.percentage:.1f}%)`,
      },
    },
    {
      type: 'pie',
      name: 'Fw Ave. Count',
      data: fwData,
      size: '80%',
      innerSize: '60%',
      dataLabels: {
        distance: 20,
        format: '<b>{point.name}:</b> <span style="opacity: 0.5">{y}%</span>',
        filter: {
          property: 'y',
          operator: '>',
          value: 1,
        },
        style: {
          fontWeight: 'normal',
        },
      },
    },
  ]

  return options
}

const processEnvCount = (logs: IPPS2MultiSinglePortLogDetail[], refData: IPieChartData): void => {
  // process env count
  const allNormalCountByServerPort: Record<string, number[]> = {}
  const allMultiCountByServerPort: Record<string, number[]> = {}

  for (const log of logs) {
    if (typeof allNormalCountByServerPort[log.serverPort] === 'undefined') {
      allNormalCountByServerPort[log.serverPort] = []
    }
    allNormalCountByServerPort[log.serverPort].push(parseInt(log.normalSampleCount, 10))

    if (typeof allMultiCountByServerPort[log.serverPort] === 'undefined') {
      allMultiCountByServerPort[log.serverPort] = []
    }
    allMultiCountByServerPort[log.serverPort].push(log.pps2MultiSinglePortSamples.length)
  }

  const aveNormalCountByServerPort: Record<string, number> = {}
  const aveMutliCountByServerPort: Record<string, number> = {}
  for (const serverPort in allNormalCountByServerPort) {
    // normal
    const counts = allNormalCountByServerPort[serverPort]
    const total = counts.reduce((acc, cur) => acc + cur, 0)
    //  round to one decimal place
    aveNormalCountByServerPort[serverPort] = Math.ceil(total / counts.length)

    // multi
    const multiCounts = allMultiCountByServerPort[serverPort]
    const multiTotal = multiCounts.reduce((acc, cur) => acc + cur, 0)
    //  round to one decimal place
    aveMutliCountByServerPort[serverPort] = Math.ceil(multiTotal / multiCounts.length)
  }

  // summary all ports
  const allNormalCount: number[] = []
  const allMultiCount: number[] = []
  for (const serverPort in aveNormalCountByServerPort) {
    allNormalCount.push(aveNormalCountByServerPort[serverPort])
    allMultiCount.push(aveMutliCountByServerPort[serverPort])
  }

  // summary
  const totalNormalCount = allNormalCount.reduce((acc, cur) => acc + cur, 0)
  const totalMultiCount = allMultiCount.reduce((acc, cur) => acc + cur, 0)

  refData.envCount.push({ name: 'Normal env', value: totalNormalCount })
  refData.envCount.push({ name: 'Multi-single port', value: totalMultiCount })
}

const processMultiIcFwCount = (logs: IPPS2MultiSinglePortLogDetail[], refData: IPieChartData): void => {
  const SamplesByServerPort: Record<string, IPPS2MultiSinglePortSample[][]> = {}
  for (const log of logs) {
    if (log.pps2MultiSinglePortSamples.length === 0) {
      continue
    }

    if (typeof SamplesByServerPort[log.serverPort] === 'undefined') {
      SamplesByServerPort[log.serverPort] = []
    }

    SamplesByServerPort[log.serverPort].push(log.pps2MultiSinglePortSamples)
  }

  // 統計各server port中的fw各自的數量

  const fwCountByServerPort: Record<string, Record<string, number>> = {}
  for (const serverPort in SamplesByServerPort) {
    // the logs of each server port
    const logsOfEachPort = SamplesByServerPort[serverPort]

    if (typeof fwCountByServerPort[serverPort] === 'undefined') {
      fwCountByServerPort[serverPort] = {}
    }

    // record the fw counr
    for (const log of logsOfEachPort) {
      for (const s of log) {
        if (typeof fwCountByServerPort[serverPort][s.fw] === 'undefined') {
          fwCountByServerPort[serverPort][s.fw] = 0
        }
        fwCountByServerPort[serverPort][s.fw]++

        // also record the fw belong to which ic
        if (icByfw[s.fw] === undefined) {
          icByfw[s.fw] = s.ic
        }
      }
    }
  }

  // get the ave of fw count
  const aveFWCount: Record<string, number> = {}
  for (const serverPort in fwCountByServerPort) {
    // whole fw count by server port
    const fc = fwCountByServerPort[serverPort]

    // get the total count of logs of each server port
    const logsCountOfEachPort = SamplesByServerPort[serverPort].length

    for (const fw in fc) {
      if (typeof aveFWCount[fw] === 'undefined') {
        aveFWCount[fw] = 0
      }

      aveFWCount[fw] += Math.ceil(fc[fw] / logsCountOfEachPort)
    }
  }

  // get summary of ic count
  const icCount: Record<string, number> = {}
  for (const fw in aveFWCount) {
    if (typeof icCount[icByfw[fw]] === 'undefined') {
      icCount[icByfw[fw]] = 0
    }

    icCount[icByfw[fw]] += aveFWCount[fw]
  }

  // create color index
  for (const ic in icCount) {
    // create color
    if (colorByIc[ic] === undefined) {
      // get random color form the color list
      const colors = Highcharts.getOptions().colors
      if (colors === undefined) {
        continue
      }

      const randomIndex = Math.floor(Math.random() * colors.length)
      colorByIc[ic] = colors[randomIndex]
    }
  }

  // convert to refData
  // 1. ic count
  for (const ic in icCount) {
    refData.multiIcCount.push({ name: ic, value: icCount[ic] })
  }

  // 2. fw count
  for (const fw in aveFWCount) {
    refData.multiFwCount.push({ name: fw, value: aveFWCount[fw] })
  }
}

// components
const PPS2MultiSinglePortChart = (): JSX.Element => {
  const [pieChartData, setPieChartData] = useState<IPieChartData>({
    envCount: [],
    multiIcCount: [],
    multiFwCount: [],
  })
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(
    moment().add(-1, 'hours').startOf('day').clone().hours(0).minutes(0).seconds(0).milliseconds(0)
  )
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(moment())

  const envCountChartRef = useRef<HighchartsReactRefObject | null>(null)
  const icCountChartRef = useRef<HighchartsReactRefObject | null>(null)

  const envCountChartOptions = getEnvCountChartOptions(pieChartData)
  const icWithFwCountChartOptions = getIcWithFwCountChartOptions(pieChartData)

  // effect
  useEffect(() => {
    if (startDateTime === null || endDateTime === null) {
      return
    }

    // req
    const range: ITimeRange = {
      startAt: startDateTime,
      endAt: endDateTime,
    }

    if (envCountChartRef.current !== null) {
      envCountChartRef.current.chart.showLoading()
    }

    if (icCountChartRef.current !== null) {
      icCountChartRef.current.chart.showLoading()
    }

    // get data
    asyncFetchData(range)
      .then((data) => {
        setPieChartData(data)
        console.log('fetch data at init success')
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        if (envCountChartRef.current !== null) {
          envCountChartRef.current.chart.hideLoading()
        }

        if (icCountChartRef.current !== null) {
          icCountChartRef.current.chart.hideLoading()
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

    // show loading
    if (envCountChartRef.current !== null) {
      envCountChartRef.current.chart.showLoading()
    }

    if (icCountChartRef.current !== null) {
      icCountChartRef.current.chart.showLoading()
    }

    asyncFetchData(range)
      .then((data) => {
        setPieChartData(data)
        console.log('fetch data by button success')
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        if (envCountChartRef.current !== null) {
          envCountChartRef.current.chart.hideLoading()
        }

        if (icCountChartRef.current !== null) {
          icCountChartRef.current.chart.hideLoading()
        }
      })
  }

  return (
    <div>
      <h1 className="mb-8 font-bold">PPS2 Multi Single Port Chart</h1>
      <div className="grid grid-cols-3 gap-1">
        {/* plot */}
        <div className="col-span-2">
          {/* tool menu */}
          <div className="grid grid-cols-12 gap-1 mb-5 h-[50px]">
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
              <CatracoButton text="Ping!" onClick={handleButtonClick}></CatracoButton>
            </div>
          </div>

          {/* chart */}
          <div className="grid grid-cols-5 gap-1">
            <div className="col-span-2">
              <HighchartsReact highcharts={Highcharts} options={envCountChartOptions} ref={envCountChartRef} />
            </div>
            <div className="col-span-3">
              <HighchartsReact highcharts={Highcharts} options={icWithFwCountChartOptions} ref={icCountChartRef} />
            </div>
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

export default PPS2MultiSinglePortChart
