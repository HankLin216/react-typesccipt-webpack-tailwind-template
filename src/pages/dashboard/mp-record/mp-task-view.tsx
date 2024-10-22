import React, { useEffect, useState } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { GetMPTaskView } from '../../../biz/mp-record'
import type { IMPTaskTableView } from '../../../biz/mp-record'
import moment from 'moment'

// css
import style from './custom-scrollbar.module.css'

const columnHelper = createColumnHelper<IMPTaskTableView>()
const defaultColumns = [
  columnHelper.accessor((props) => props.PjId, { id: 'PjId', header: () => 'Project ID', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.ForcePcieFlowName, {
    id: 'ForcePcieFlowName',
    header: 'Force PCIe Flow',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((props) => props.ForceBootCodeName, {
    id: 'ForceBootCodeName',
    header: 'Force Boot Code',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((props) => props.UserRealName, { id: 'UserRealName', header: 'User Name', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.IP, { id: 'Ip', header: 'IP', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.ControllerID, { id: 'ControllerID', header: 'Controller ID', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.IC, { id: 'Ic', header: 'IC', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.FwVersion, { id: 'FwVersion', header: 'Fw Version', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.FwSubVersion, { id: 'FwSubVersion', header: 'Fw Subversion', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.MpErrorCode, { id: 'MpErrorCode', header: 'Error Code', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.MpResultName, { id: 'MpResultName', header: 'MP Result', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.MpEnvironmentName, {
    id: 'MpEnvironmentName',
    header: 'Environment',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((props) => props.TkId, { id: 'TkId', header: 'Task ID', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.IdleStartTime, { id: 'IdleStartTime', header: 'Build At', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.PrepareStartTime, {
    id: 'PrepareStartTime',
    header: 'Start At',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((props) => props.TestEndTime, { id: 'TestEndTime', header: 'End At', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.ToolName, { id: 'ToolName', header: 'Tool Name', cell: (info) => info.getValue() }),
  columnHelper.accessor((props) => props.TestStatusName, {
    id: 'TestStatusName',
    header: 'Test Status',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((props) => props.TestResultName, { id: 'TestResultName', header: 'Test Result', cell: (info) => info.getValue() }),
]

const MPTaskView = (): JSX.Element => {
  const [tasks, setTasks] = useState<IMPTaskTableView[]>([])

  useEffect(() => {
    const treq = { createTimeFrom: moment().subtract(12, 'hours'), createTimeTo: moment() }
    GetMPTaskView(treq)
      .then((res) => {
        setTasks(res)
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])

  const table = useReactTable({
    data: tasks,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex justify-center">
      <div className={`${style['custom-scrollbar']} overflow-auto h-[550px] w-4/5`}>
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky z-10 top-0 text-base leading-10 font-bold bg-white px-4 text-center whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-t border-b border-gray-300 px-4 text-left">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MPTaskView
