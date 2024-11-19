interface IMPTaskViewRequest {
  createTimeFrom: moment.Moment
  createTimeTo: moment.Moment
}

interface IMPTaskViewResponse {
  tasks: IMPTaskView[]
}

interface IMPTaskView {
  mpTask: IMPTask
  mpProject: IMPProject
  mpLog: IMPLog
}

interface IMPTask {
  tkId: number
  tlId: number
  mainTkId: number
  testStatus: number
  testResult: number
  testResultPath: string
  toolExtraParams: string
  idleStartTime: string
  prepareStartTime: string
  testEndTime: string
  toolName: string
  testStatusName: string
  testResultName: string
}

interface IMPProject {
  pjId: number
  settingFile: string
  memo: string
  forcePcieFlowName: string
  forceBootCodeName: string
}

interface IMPLog {
  mpLogId: number
  userRealName: string
  testerName: string
  ic: string
  fwVersion: string
  fwSubVersion: string
  mpEnvironment: number
  mpResult: number
  mpErrorCode: string
  mpResultName: string
  mpEnvironmentName: string
}

interface IMPPackageSlice {
  mpPackageInBase64: string
}
interface IMPPackageResponse {
  result: IMPPackageSlice
}

async function GetMPTaskView({ createTimeFrom, createTimeTo }: IMPTaskViewRequest): Promise<IMPTaskViewResponse> {
  const url = new URL(`${process.env.TIC_BASE_URL}/v1/view/mp`)
  const params = {
    create_time_from: createTimeFrom.toISOString(true),
    create_time_to: createTimeTo.toISOString(true),
  }

  url.search = new URLSearchParams(params).toString()

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

async function GetMPPackage(pjid: number): Promise<IMPPackageResponse> {
  const url = new URL(`${process.env.TIC_BASE_URL}/v1/mp_log/mp-package/${pjid}`)
  const reader = await fetch(url.toString()).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
    }

    const reader = res.body?.getReader()
    if (reader === undefined) {
      throw new Error('GetMPPackage: Failed to get reader')
    }

    return reader
  })

  const chunk: string[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    if (value !== undefined) {
      chunk.push(new TextDecoder().decode(value))
    }
  }

  const cj = chunk.join('')
  const ret: IMPPackageResponse = {
    result: {
      mpPackageInBase64: '',
    },
  }
  cj.split('\n').forEach((slice) => {
    if (slice === '') {
      return
    }
    const mpPackageSlice: IMPPackageResponse = JSON.parse(slice)
    ret.result.mpPackageInBase64 += mpPackageSlice.result.mpPackageInBase64
  })

  return ret
}

export { GetMPTaskView, GetMPPackage }

export type { IMPTaskViewRequest, IMPTaskViewResponse, IMPTaskView, IMPTask, IMPProject, IMPLog }
