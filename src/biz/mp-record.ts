import { GetMPTaskView as dGetMPTaskView } from '../data/mp'
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
      ForcePcieFlowName: task.mpProject.forcePcieFlowName,
      ForceBootCodeName: task.mpProject.forceBootCodeName,
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
      ToolName: task.mpTask.toolName,
      TestStatusName: task.mpTask.testStatusName,
      TestResultName: task.mpTask.testResultName,
    }
    ret.push(view)
  }

  return ret
}

export { GetMPTaskView }

export type { IMPTaskTableView }
