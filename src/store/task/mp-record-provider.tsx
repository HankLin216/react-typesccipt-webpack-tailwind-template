import React, { createContext, useState } from 'react'
import type { IMPDReport } from '../../data/mp'

interface IMPDReportInfo extends IMPDReport {
  ControllerID: string
  IP: string
  FwVersion: string
  Result: string
  ErrorCode: string
  IC: string
}

interface IMPRecordContext {
  DReports: IMPDReportInfo[]
  setDReports: (DReports: IMPDReportInfo[]) => void
}

const MPRecordContext = createContext<IMPRecordContext>({
  DReports: [],
  setDReports: () => {},
})

const MPRecordProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const [DReports, setDReports] = useState<IMPDReportInfo[]>([])

  return <MPRecordContext.Provider value={{ DReports, setDReports }}>{props.children}</MPRecordContext.Provider>
}

export default MPRecordProvider
export { MPRecordContext }
export type { IMPDReportInfo }
