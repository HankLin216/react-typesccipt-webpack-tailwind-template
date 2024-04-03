import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { splitTimeRange } from '../../utils/time'
import type { ITimeRange } from '../../types/time'
import * as Highcharts from 'highcharts'
import HighchartsReact, { type HighchartsReactRefObject } from 'highcharts-react-official'
import CatracoButton from '../../components/button/catraco'
import loadingGif from '../../assets/gif/Ghost.gif'

// const baseUrl = 'http://192.168.197.93:9001/v1'
const baseUrl = 'http://192.168.43.139:8000/v1'

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
}

interface IPieSubData {
  name: string
  value: number
}

// async function
const getRawPPS2MultiSinglePortLogs = async (req: IPPS2MultiSinglePortLogRequest): Promise<IPPS2MultiSinglePortLogResponse> => {
  const url = `${baseUrl}/multi_single_port_log_detail`
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
  // split time range into parts that each part is 10 days
  const timeRanges: ITimeRange[] = splitTimeRange(range, 10)

  const ret: IPieChartData = {
    envCount: [],
    multiIcCount: [],
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
  processMultiIcCount(allLogs, ret)

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

const getIcCountChartOptions = (data: IPieChartData): Highcharts.Options => {
  const icData: Highcharts.PointOptionsObject[] = []

  for (const d of data.multiIcCount) {
    icData.push({
      name: d.name,
      sliced: d.name === 'PS5027',
      y: d.value,
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
      name: 'Ave. Count',
      data: icData,
      dataLabels: {
        enabled: true,
        format: `<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)`,
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
    aveNormalCountByServerPort[serverPort] = Math.round(10 * (total / counts.length)) / 10

    // multi
    const multiCounts = allMultiCountByServerPort[serverPort]
    const multiTotal = multiCounts.reduce((acc, cur) => acc + cur, 0)
    //  round to one decimal place
    aveMutliCountByServerPort[serverPort] = Math.round(10 * (multiTotal / multiCounts.length)) / 10
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

const processMultiIcCount = (logs: IPPS2MultiSinglePortLogDetail[], refData: IPieChartData): void => {
  const serverLogsCountByServerPort: Record<string, number> = {}
  const SamplesByServerPort: Record<string, IPPS2MultiSinglePortSample[][]> = {}
  for (const log of logs) {
    if (log.pps2MultiSinglePortSamples.length === 0) {
      continue
    }

    if (typeof SamplesByServerPort[log.serverPort] === 'undefined') {
      SamplesByServerPort[log.serverPort] = []
    }

    if (typeof serverLogsCountByServerPort[log.serverPort] === 'undefined') {
      serverLogsCountByServerPort[log.serverPort] = 0
    }

    if (typeof SamplesByServerPort[log.serverPort][serverLogsCountByServerPort[log.serverPort]] === 'undefined') {
      SamplesByServerPort[log.serverPort][serverLogsCountByServerPort[log.serverPort]] = []
    }

    SamplesByServerPort[log.serverPort][serverLogsCountByServerPort[log.serverPort]].push(...log.pps2MultiSinglePortSamples)
    serverLogsCountByServerPort[log.serverPort]++
  }

  // 統計每個log中在每個server port的ic數量
  const SamplesICCountOfEachLogByServerPort: Record<string, Array<Record<string, number>>> = {}
  for (const sp in SamplesByServerPort) {
    const d = SamplesByServerPort[sp]

    if (typeof SamplesICCountOfEachLogByServerPort[sp] === 'undefined') {
      SamplesICCountOfEachLogByServerPort[sp] = []
    }

    // very log
    for (const sd of d) {
      const icCount: Record<string, number> = {}
      for (const s of sd) {
        if (typeof icCount[s.ic] === 'undefined') {
          icCount[s.ic] = 0
        }
        icCount[s.ic]++
      }

      SamplesICCountOfEachLogByServerPort[sp].push(icCount)
    }
  }

  // 統計每個server port的ic平均數量
  const aveICCountByServerPort: Record<string, Record<string, number>> = {}
  for (const sp in SamplesICCountOfEachLogByServerPort) {
    const d = SamplesICCountOfEachLogByServerPort[sp]
    if (typeof aveICCountByServerPort[sp] === 'undefined') {
      aveICCountByServerPort[sp] = {}
    }

    const counts: Record<string, number> = {}
    for (const icCountOfEachLog of d) {
      for (const ic in icCountOfEachLog) {
        if (typeof aveICCountByServerPort[sp][ic] === 'undefined') {
          aveICCountByServerPort[sp][ic] = 0
        }

        if (typeof counts[ic] === 'undefined') {
          counts[ic] = 0
        }

        aveICCountByServerPort[sp][ic] += icCountOfEachLog[ic]
        counts[ic]++
      }
    }

    for (const ic in aveICCountByServerPort[sp]) {
      aveICCountByServerPort[sp][ic] = Math.round(10 * (aveICCountByServerPort[sp][ic] / counts[ic])) / 10
    }
  }

  // summary all ic of ports
  const allICCount: Record<string, number> = {}
  for (const serverPort in aveICCountByServerPort) {
    for (const ic in aveICCountByServerPort[serverPort]) {
      if (typeof allICCount[ic] === 'undefined') {
        allICCount[ic] = 0
      }

      allICCount[ic] += aveICCountByServerPort[serverPort][ic]
    }
  }

  // convert ot ret data
  for (const ic in allICCount) {
    refData.multiIcCount.push({ name: ic, value: allICCount[ic] })
  }
}

// components
const PPS2MultiSinglePortChart = (): JSX.Element => {
  const [pieChartData, setPieChartData] = useState<IPieChartData>({
    envCount: [],
    multiIcCount: [],
  })
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(
    moment().add(-1, 'hours').startOf('day').clone().hours(0).minutes(0).seconds(0).milliseconds(0)
  )
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(moment())

  const envCountChartRef = useRef<HighchartsReactRefObject | null>(null)
  const icCountChartRef = useRef<HighchartsReactRefObject | null>(null)

  const envCountChartOptions = getEnvCountChartOptions(pieChartData)
  const icCountChartOptions = getIcCountChartOptions(pieChartData)

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
              <CatracoButton text="Ping!" onClick={handleButtonClick}></CatracoButton>
            </div>
          </div>

          {/* chart */}
          <div className="grid grid-cols-2 gap-1">
            <div>
              <HighchartsReact highcharts={Highcharts} options={envCountChartOptions} ref={envCountChartRef} />
            </div>
            <div>
              <HighchartsReact highcharts={Highcharts} options={icCountChartOptions} ref={icCountChartRef} />
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
