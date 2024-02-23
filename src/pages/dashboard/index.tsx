import React, { useState, useEffect } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment'

const baseUrl = 'http://192.168.197.93:9001/v1'
// const baseUrl = 'http://192.168.43.139:8000/v1'

// api data types
interface ITimeRange {
  startAt: moment.Moment
  endAt: moment.Moment
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

interface ISwtichToolLogRequest extends ITimeRange {}

interface ISwtichToolLogResponse {
  switchToolLogs: ISwtichToolLog[]
}

interface ISwtichToolLog {
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

// process datat type
interface ISwitchToolAmountChartData {
  amountOfICByWeeks: ISwtichToolAmountOfIC[]
  aveProjectProgressOfICByWeeks: IAveOfProjectProgressOfIC[]
}

async function getRawSwtichToolLogs(req: ISwtichToolLogRequest): Promise<ISwtichToolLogResponse> {
  const res = await fetch(`${baseUrl}/switch_tool_logs_detail`, {
    method: 'POST',
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

async function getRawListProjectProgress(req: IListProjectProgressRequest): Promise<IListProjectProgressResponse> {
  const res = await fetch(`${baseUrl}/project/progress`, {
    method: 'POST',
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

const processRawSwtichToolLogs = (
  data: ISwtichToolLog[],
  timeRange: ITimeRange,
  objectIc?: string[]
): ISwtichToolAmountOfIC[] => {
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

const processRawProjectProgress = (
  data: IProjectProgress[],
  timeRange: ITimeRange,
  objectIc?: string[]
): IAveOfProjectProgressOfIC[] => {
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

const buildWeeks = (startAt: moment.Moment, endAt: moment.Moment): string[] => {
  const weeks: string[] = []
  while (startAt.isBefore(endAt)) {
    const week = `${startAt.weekYear()}-${startAt.week()}w`
    weeks.push(week)
    startAt = startAt.add(1, 'week')
  }

  return weeks
}

const Dashboard = (): JSX.Element => {
  const [switchToolAmountChartData, setSwitchToolAmountChartData] = useState<ISwitchToolAmountChartData>({
    amountOfICByWeeks: [],
    aveProjectProgressOfICByWeeks: [],
  })
  const options = getAmountOfSwitchToolChartOptions(switchToolAmountChartData)

  // fetch data effect
  useEffect(() => {
    // time
    const timeRange: ITimeRange = {
      startAt: moment('2023-10-01T00:00:00.000Z'),
      endAt: moment(),
    }

    // search data for each 10 days
    // get requests
    const requestsData: ITimeRange[] = []
    const startDate = timeRange.startAt.clone()
    while (!startDate.isAfter(timeRange.endAt)) {
      const endDate = startDate.clone().add(10, 'days')
      requestsData.push({
        startAt: startDate.clone(),
        endAt: endDate.isAfter(timeRange.endAt) ? timeRange.endAt : endDate,
      })

      // update
      startDate.add(10, 'days')
    }

    // async function
    const fetchData = async (): Promise<void> => {
      try {
        const logRequests: Array<Promise<ISwtichToolLogResponse>> = []
        const progressRequests: Array<Promise<IListProjectProgressResponse>> = []
        for (const req of requestsData) {
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
        const allLogs: ISwtichToolLog[] = []
        const logRess = await Promise.all(logRequests)
        for (const res of logRess) {
          allLogs.push(...res.switchToolLogs)
        }

        const allProgress: IProjectProgress[] = []
        const progressRess = await Promise.all(progressRequests)
        for (const res of progressRess) {
          allProgress.push(...res.projectProgress)
        }

        // process raw data
        const objectIc = ['PS5021', 'PS5022', 'PS5025', 'PS5026', 'PS5027']
        const pLogs = processRawSwtichToolLogs(allLogs, timeRange, objectIc)
        const pProgress = processRawProjectProgress(allProgress, timeRange, objectIc)

        setSwitchToolAmountChartData({
          amountOfICByWeeks: pLogs,
          aveProjectProgressOfICByWeeks: pProgress,
        })
      } catch (e) {
        console.error(e)
      }
    }

    // start fetch
    fetchData()
      .then(() => {
        console.log('fetch data success')
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])

  return (
    <div style={{ border: '1px solid red' }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default Dashboard
