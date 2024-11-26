import React, { useContext, useEffect, useState } from 'react'
// store
import { MPRecordContext } from '../../../store/task/mp-record-provider'
// css
import style from '../../../components/scollbar/styles.module.css'
// icons
import DeleteIcon from '@mui/icons-material/Delete'

const LOG_VIEW_HEIGHT_TAILWIND = `h-[650px]`
const LOG_TAB_CONTENT_HEIGHT_TAILWIND = `h-[550px]`

const MPLogView = (): JSX.Element => {
  const [activateTab, setActivateTab] = useState<string>('')
  const [activateSubTab, setActivateSubTab] = useState<string>('')
  const ctx = useContext(MPRecordContext)

  useEffect(() => {
    if (ctx.DReports.length === 0 || ctx.DReports[0].mpSequenceDReports.length === 0) {
      return
    }
    const k = `${ctx.DReports[0].tkId}`
    const sk = `${k}-${ctx.DReports[0].mpSequenceDReports[0].sequence}`
    setActivateTab(k)
    setActivateSubTab(sk)
  }, [ctx.DReports])

  return (
    <div className={`${LOG_VIEW_HEIGHT_TAILWIND} w-full bg-white shadow p-2 mt-2`}>
      {/* titile */}
      <div className="p-2 flex justify-between">
        <h4 className="font-bold text-left pl-2 text-lg">MP Log View</h4>
        <span
          onClick={() => {
            ctx.setDReports([])
            setActivateTab('')
            setActivateSubTab('')
          }}
          className="hover:cursor-pointer text-gray-400 hover:text-gray-900"
          title="Clear all logs"
        >
          <DeleteIcon></DeleteIcon>
        </span>
      </div>
      {/* tab */}
      <div className={`overflow-auto flex ${style['custom-scrollbar-thin']}`}>
        {ctx.DReports.length === 0 ? (
          <div className={`h-10 p-2 text-gray-400`}>No Log</div>
        ) : (
          ctx.DReports.map((report, _) => {
            const k = `${report.tkId}`
            let sk = ''
            if (report.mpSequenceDReports.length > 0) {
              sk = `${report.tkId}-${report.mpSequenceDReports[0].sequence}`
            }
            return (
              <div
                key={k}
                className={`h-10 hover:cursor-pointer whitespace-nowrap p-2 
                  ${activateTab === k ? ' bg-indigo-50 border-t-2 border-indigo-300' : ''} 
                  ${activateTab === k ? (report.Result === 'Pass' ? 'text-gray-900' : 'text-red-700') : ''}
                  ${report.Result === 'Pass' ? 'text-gray-400' : 'text-red-700'}`}
                onClick={() => {
                  setActivateTab(k)
                  setActivateSubTab(sk)
                }}
              >
                {report.IP}-{report.ControllerID}
              </div>
            )
          })
        )}
      </div>
      {/* divider */}
      <div className="border-b border-black"></div>
      {/* tab content */}
      {ctx.DReports.map((report, _) => {
        const k = `${report.tkId}`
        return (
          <div key={k} className={`w-full ${activateTab !== k ? 'hidden' : ''}`}>
            <div className="grid grid-cols-12">
              {/* side bar */}
              <div className={`col-span-3 p-1 z-20 ${LOG_TAB_CONTENT_HEIGHT_TAILWIND} shadow-rightSideBarShadow`}>
                {/* infos */}
                <div className="grid grid-rows-5 mb-3 gap-1">
                  {/* ic */}
                  <div className="row-span-1 grid grid-cols-7">
                    <div className="col-span-3 text-sm">
                      <strong>IC: </strong>
                    </div>
                    <div className="col-span-4 text-sm">{report.IC}</div>
                  </div>
                  {/* fw */}
                  <div className="row-span-1 grid grid-cols-7">
                    <div className="col-span-3 text-sm">
                      <strong>Fw Version: </strong>
                    </div>
                    <div className="col-span-4 break-words text-sm">{report.FwVersion}</div>
                  </div>
                  {/* err code */}
                  <div className="row-span-1 grid grid-cols-7">
                    <div className="col-span-3 text-sm">
                      <strong>Error Code: </strong>
                    </div>
                    <div className="col-span-4 text-sm">{report.ErrorCode === '' ? 'Empty' : report.ErrorCode}</div>
                  </div>
                  {/* pj id */}
                  <div className="row-span-1 grid grid-cols-7">
                    <div className="col-span-3 text-sm">
                      <strong>PJ ID: </strong>
                    </div>
                    <div className="col-span-4 text-sm">{report.pjId}</div>
                  </div>
                  {/* tk id */}
                  <div className="row-span-1 grid grid-cols-7">
                    <div className="col-span-3 text-sm">
                      <strong>TK ID: </strong>
                    </div>
                    <div className="col-span-4 text-sm">{report.tkId}</div>
                  </div>
                </div>
                {/* seqs */}
                <div className="flex flex-col">
                  <div className="mb-2">
                    <strong>Files:</strong>
                  </div>
                  {report.mpSequenceDReports.map((seq, _) => {
                    const sk = `${report.tkId}-${seq.sequence}`
                    const pathParts = seq.path.split('\\')
                    let lastPart = '1.txt'
                    if (pathParts.length !== 0) {
                      lastPart = pathParts[pathParts.length - 1]
                    }
                    return (
                      <div
                        key={`${k}-${seq.sequence}`}
                        className="flex"
                        onClick={() => {
                          setActivateSubTab(sk)
                        }}
                      >
                        <div className={`${activateSubTab === sk ? ' border-l-2 border-indigo-900' : ''}`}></div>
                        <div className={`leading-8 hover:cursor-pointer pl-2 ${activateSubTab === sk ? 'text-gray-900' : ''}`}>
                          {lastPart}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* logs */}
              <div className="col-span-9">
                {report.mpSequenceDReports.length > 0
                  ? report.mpSequenceDReports.map((seq, idx) => {
                      const sk = `${report.tkId}-${seq.sequence}`
                      return (
                        <div
                          key={`${k}-${seq.sequence}`}
                          className={`overflow-auto ${
                            style['custom-scrollbar-thin']
                          } ${LOG_TAB_CONTENT_HEIGHT_TAILWIND} whitespace-pre-wrap ${activateSubTab !== sk ? 'hidden' : ''}`}
                        >
                          <div className="sticky top-0 text-xs whitespace-nowrap mb-1 p-2 bg-white">
                            <strong>Path: </strong>
                            {seq.path}
                          </div>
                          <div className="p-2">{window.atob(report.mpSequenceDReports[idx].logInBase64)}</div>
                        </div>
                      )
                    })
                  : ''}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MPLogView
