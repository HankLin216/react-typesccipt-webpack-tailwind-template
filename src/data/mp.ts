interface IMPTaskViewRequest {
  createTimeFrom: moment.Moment
  createTimeTo: moment.Moment
}

interface IMPTaskViewResponse {
  tasks: IMPTaskView[]
}

interface IMPTaskView {
  tkId: string
  tlId: string
  mainTkId: string
  testStatus: string
  testResult: string
  testResultPath: string
  toolExtraParams: string
  idleStartTime: string
  prepareStartTime: string
  testEndTime: string
  toolName: string
  testStatusName: string
  testResultName: string
  pjId: string
  settingFile: string
  memo: string
  forcePcieFlowName: string
  forceBootCodeName: string
  userRealName: string
  testerName: string
  ic: string
  fwVersion: string
  fwSubVersion: string
  mpLogId: string
  mpEnvironment: string
  mpResult: string
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

interface IMPDReportRequest {
  report_requests: IMPDReportRequestInfo[]
}

interface IMPDReportRequestInfo {
  pjId: number
  tkId: number
}

interface IMPDReportResponse {
  reports: IMPDReport[]
}

interface IMPDReport {
  pjId: string
  tkId: string
  mpSequenceDReports: IMPSequenceDReport[]
}

interface IMPSequenceDReport {
  sequence: string
  logInBase64: string
  path: string
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

async function GetMPDRepots(req: IMPDReportRequest): Promise<IMPDReportResponse> {
  const url = new URL(`${process.env.TIC_BASE_URL}/v1/mp_log/dreports`)
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

export { GetMPTaskView, GetMPPackage, GetMPDRepots }

export type {
  IMPTaskViewRequest,
  IMPTaskViewResponse,
  IMPTaskView,
  IMPDReportRequest,
  IMPDReportResponse,
  IMPDReport,
  IMPDReportRequestInfo,
  IMPSequenceDReport,
  IMPPackageSlice,
  IMPPackageResponse,
}
