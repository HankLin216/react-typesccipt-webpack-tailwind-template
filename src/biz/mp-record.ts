import { GetMPTaskView as dGetMPTaskView, GetMPDRepots as dGetMPDRepots, GetMPPackage as dGetMPPackage } from '../data/mp'
import type { IMPTaskViewRequest, IMPDReport, IMPDReportRequest } from '../data/mp'

interface IMPTaskTableView {
  PjId: string
  ForcePcieFlowName: string
  ForceBootCodeName: string
  UserRealName: string
  IP: string
  ControllerID: string
  IC: string
  FwVersion: string
  FwSubVersion: string
  MpErrorCode: string
  MpResultName: string
  MpEnvironmentName: string
  TkId: string
  IdleStartTime: string
  PrepareStartTime: string
  TestEndTime: string
  ToolName: string
  TestStatusName: string
  TestResultName: string
}

interface IGetDReportInfo {
  pjId: string
  tkId: string
}

const RenameToolName = (toolName: string): string => {
  let ret = toolName
  if (toolName === 'NO_TEST_TOOL') {
    ret = '遠端開卡'
  } else if (toolName === 'MP') {
    ret = '測試前開卡'
  } else if (toolName === 'POST_MP') {
    ret = '測試後開卡'
  }
  return ret
}

const RenameForcePCIeFlowName = (forcePcieFlowName: string): string => {
  let ret = forcePcieFlowName
  if (forcePcieFlowName === 'AutoDetect') {
    ret = '自動'
  } else if (forcePcieFlowName === 'NoTester') {
    ret = '不斷電'
  } else if (forcePcieFlowName === 'OnePort') {
    ret = '斷電'
  }
  return ret
}

const RenameForceBootCodeName = (forceBootCodeName: string): string => {
  let ret = forceBootCodeName
  if (forceBootCodeName === 'AutoDetect') {
    ret = '自動'
  } else if (forceBootCodeName === 'Enable') {
    ret = '使用'
  } else if (forceBootCodeName === 'Disable') {
    ret = '不使用'
  }
  return ret
}

async function GetMPTaskView(req: IMPTaskViewRequest): Promise<IMPTaskTableView[]> {
  const ret: IMPTaskTableView[] = []
  const resp = await dGetMPTaskView(req)

  for (const task of resp.tasks) {
    const tinfos = task.testerName.split('_')
    if (tinfos.length < 3) {
      continue
    }

    const ctrlId = tinfos[2]
    const ip = tinfos[1]

    const view: IMPTaskTableView = {
      PjId: task.pjId,
      ForcePcieFlowName: RenameForcePCIeFlowName(task.forcePcieFlowName),
      ForceBootCodeName: RenameForceBootCodeName(task.forceBootCodeName),
      UserRealName: task.userRealName,
      IP: ip,
      ControllerID: ctrlId,
      IC: task.ic,
      FwVersion: task.fwVersion,
      FwSubVersion: task.fwSubVersion,
      MpErrorCode: task.mpErrorCode,
      MpResultName: task.mpResultName,
      MpEnvironmentName: task.mpEnvironmentName,
      TkId: task.tkId,
      IdleStartTime: task.idleStartTime,
      PrepareStartTime: task.prepareStartTime,
      TestEndTime: task.testEndTime,
      ToolName: RenameToolName(task.toolName),
      TestStatusName: task.testStatusName,
      TestResultName: task.testResultName,
    }
    ret.push(view)
  }

  return ret
}

async function GetMPDRepots(req: IGetDReportInfo[]): Promise<IMPDReport[]> {
  const ret: IMPDReport[] = []
  const reqs: IMPDReportRequest = {
    report_requests: [],
  }
  for (const r of req) {
    reqs.report_requests.push({ pjId: parseInt(r.pjId), tkId: parseInt(r.tkId) })
  }
  const resp = await dGetMPDRepots(reqs)
  for (const r of resp.reports) {
    const ms: IMPDReport['mpSequenceDReports'] = []
    for (const s of r.mpSequenceDReports) {
      ms.push({
        sequence: s.sequence,
        logInBase64: s.logInBase64,
        path: s.path,
      })
    }
    ret.push({
      pjId: r.pjId,
      tkId: r.tkId,
      mpSequenceDReports: ms,
    })
  }
  return ret
}

async function GetMPPackage(pjid: number): Promise<Blob> {
  const resp = await dGetMPPackage(pjid)
  return base64ToBlob(resp.result.mpPackageInBase64, 'application/zip')
}

function base64ToBlob(base64: string, contentType = '', sliceSize = 512): Blob {
  const byteCharacters = window.atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

export { GetMPTaskView, GetMPPackage, GetMPDRepots }

export type { IMPTaskTableView, IGetDReportInfo }
