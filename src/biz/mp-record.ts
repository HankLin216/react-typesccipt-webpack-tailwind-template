import { GetMPTaskView as dGetMPTaskView, GetMPPackage as dGetMPPackage } from '../data/mp'
import type { IMPTaskViewRequest } from '../data/mp'

interface IMPTaskTableView {
  PjId: number
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
  TkId: number
  IdleStartTime: string
  PrepareStartTime: string
  TestEndTime: string
  ToolName: string
  TestStatusName: string
  TestResultName: string
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
    const tinfos = task.mpLog.testerName.split('_')
    if (tinfos.length < 3) {
      continue
    }

    const ctrlId = tinfos[2]
    const ip = tinfos[1]

    const view: IMPTaskTableView = {
      PjId: task.mpProject.pjId,
      ForcePcieFlowName: RenameForcePCIeFlowName(task.mpProject.forcePcieFlowName),
      ForceBootCodeName: RenameForceBootCodeName(task.mpProject.forceBootCodeName),
      UserRealName: task.mpLog.userRealName,
      IP: ip,
      ControllerID: ctrlId,
      IC: task.mpLog.ic,
      FwVersion: task.mpLog.fwVersion,
      FwSubVersion: task.mpLog.fwSubVersion,
      MpErrorCode: task.mpLog.mpErrorCode,
      MpResultName: task.mpLog.mpResultName,
      MpEnvironmentName: task.mpLog.mpEnvironmentName,
      TkId: task.mpTask.tkId,
      IdleStartTime: task.mpTask.idleStartTime,
      PrepareStartTime: task.mpTask.prepareStartTime,
      TestEndTime: task.mpTask.testEndTime,
      ToolName: RenameToolName(task.mpTask.toolName),
      TestStatusName: task.mpTask.testStatusName,
      TestResultName: task.mpTask.testResultName,
    }
    ret.push(view)
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

export { GetMPTaskView, GetMPPackage }

export type { IMPTaskTableView }
