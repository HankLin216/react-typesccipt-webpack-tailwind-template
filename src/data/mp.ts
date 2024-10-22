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

async function GetMPTaskView({ createTimeFrom, createTimeTo }: IMPTaskViewRequest): Promise<IMPTaskViewResponse> {
  const url = new URL(`${process.env.TIC_BASE_URL}/view/mp`)
  const params = {
    create_time_from: createTimeFrom.toISOString(),
    create_time_to: createTimeTo.toISOString(),
  }

  url.search = new URLSearchParams(params).toString()

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(`Failed to fetch the data, status code: ${res.status}, message: ${res.statusText}`)
  }

  return await res.json()
}

export { GetMPTaskView }

export type { IMPTaskViewRequest, IMPTaskViewResponse, IMPTaskView, IMPTask, IMPProject, IMPLog }
