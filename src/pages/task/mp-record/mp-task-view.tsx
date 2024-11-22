import React, { useEffect, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { GetMPTaskView, GetMPDRepots } from '../../../biz/mp-record'
import moment from 'moment'
import DropdownMenu from './mp-task-view-dropdown-menu'
import Continuous from '../../../components/loading/continuous'
import ToolBar from './mp-task-view-toolbar'
import Pagination from './mp-task-view-pagination'
// types
import type { HTMLProps } from 'react'
import type { IMPTaskTableView, IGetDReportInfo } from '../../../biz/mp-record'
import type {
  Column,
  RowData,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnOrderState,
  Row,
  Table,
} from '@tanstack/react-table'
import type { DropdownItem } from './mp-task-view-dropdown-menu'
// icons
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
// css
import style from '../../../components/scollbar/styles.module.css'
declare module '@tanstack/react-table' {
  // allows us to define custom properties for our columns
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const ContainInArray = (row: Row<IMPTaskTableView>, columnId: string, filterValue: any): boolean => {
  if (filterValue === null || filterValue === undefined) {
    return true
  }

  // is not array
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true
  }

  for (let i = 0; i < row.getAllCells().length; i++) {
    const cell = row.getAllCells()[i]
    if (cell.column.id === columnId) {
      return filterValue.includes(cell.getValue())
    }
  }

  return false
}

const beautifyDate = (date: string): string => {
  return moment(date).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')
}

const beautifyResult = (result: string): JSX.Element => {
  let className = 'text-gray-400-400'
  if (result === 'Pass') {
    className = 'text-green-400'
  } else if (result === 'Fail') {
    className = 'text-red-400'
  } else {
    className = 'text-yellow-400'
  }
  return <span className={`${className}`}>{result}</span>
}

const formatFwVersion = (fwVersion: string, fwSubVersion: string): string => {
  if (fwSubVersion === '' || fwSubVersion === 'fwCommitId') {
    return fwVersion
  }
  return `${fwVersion}-${fwSubVersion}`
}

const getColumnData = (column: Column<IMPTaskTableView, unknown>): any[] => {
  if (column !== undefined) {
    return column.getFacetedRowModel().rows.map((row) => row.getValue(column.id))
  }
  return []
}

const getFilterColumnData = (column: Column<IMPTaskTableView, unknown>): DropdownItem[] => {
  const ret: DropdownItem[] = []
  const data = getColumnData(column)
  if (data.length === 0) {
    return ret
  }
  // distinct
  const distinctData = [...new Set(data)]
  // tidy up
  for (let i = 0; i < distinctData.length; i++) {
    let l = ''
    if (distinctData[i] === null || distinctData[i] === undefined) {
      l = 'null'
    } else if (distinctData[i] === '') {
      l = 'empty'
    } else {
      l = distinctData[i].toString()
    }

    ret.push({ label: l, value: distinctData[i], checked: false })
  }

  // sort
  return ret.sort((a, b) => {
    return a.label.localeCompare(b.label)
  })
}

const oneDayBefore = moment().add(-1, 'days').startOf('day').clone().hours(0).minutes(0).seconds(0).milliseconds(0)
const columnHelper = createColumnHelper<IMPTaskTableView>()
const defaultColumns = [
  {
    id: 'select',
    header: ({ table }: { table: Table<IMPTaskTableView> }) => (
      <IndeterminateCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }: { row: Row<IMPTaskTableView> }) => (
      <IndeterminateCheckbox
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler(),
        }}
      />
    ),
  },
  columnHelper.accessor((props) => props.PjId, {
    id: 'PjId',
    header: 'Project ID',
    cell: (info) => info.getValue(),
    meta: {
      filterVariant: 'text',
    },
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.TkId, {
    id: 'TkId',
    header: 'Task ID',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.ToolName, {
    id: 'ToolName',
    header: 'Category',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.IP, { id: 'Ip', header: 'IP', cell: (info) => info.getValue(), filterFn: ContainInArray }),
  columnHelper.accessor((props) => props.IC, { id: 'Ic', header: 'IC', cell: (info) => info.getValue(), filterFn: ContainInArray }),
  columnHelper.accessor((props) => props.ControllerID, {
    id: 'ControllerID',
    header: 'Controller ID',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.FwVersion, {
    id: 'FwVersion',
    header: 'Fw Version',
    cell: ({ row }) => formatFwVersion(row.original.FwVersion, row.original.FwSubVersion),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.TestStatusName, {
    id: 'TestStatusName',
    header: 'Test Status',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.TestResultName, {
    id: 'TestResultName',
    header: 'Test Result',
    cell: (info) => beautifyResult(info.getValue()),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.MpErrorCode, {
    id: 'MpErrorCode',
    header: 'Error Code',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.MpEnvironmentName, {
    id: 'MpEnvironmentName',
    header: 'Environment',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.ForcePcieFlowName, {
    id: 'ForcePcieFlowName',
    header: '開卡方式',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.ForceBootCodeName, {
    id: 'ForceBootCodeName',
    header: 'Force Boot Code',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.UserRealName, {
    id: 'UserRealName',
    header: 'User',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.IdleStartTime, {
    id: 'IdleStartTime',
    header: 'Create At',
    cell: (info) => <span className="text-nowrap">{beautifyDate(info.getValue())}</span>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor((props) => props.PrepareStartTime, {
    id: 'PrepareStartTime',
    header: 'Start At',
    cell: (info) => <span className="text-nowrap">{beautifyDate(info.getValue())}</span>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor((props) => props.TestEndTime, {
    id: 'TestEndTime',
    header: 'End At',
    cell: (info) => <span className="text-nowrap">{beautifyDate(info.getValue())}</span>,
    enableColumnFilter: false,
  }),
]

const MPTaskView = (): JSX.Element => {
  const defaultPinColIDs = ['IdleStartTime']
  const [tasks, setTasks] = useState<IMPTaskTableView[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([])
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [...defaultPinColIDs],
  })
  const [loading, setLoading] = useState(true)

  const table = useReactTable({
    data: tasks,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // client side filtering
    getSortedRowModel: getSortedRowModel(), // client-side sorting
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting, // optionally control sorting state in your own scope for easy access
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    state: {
      pagination,
      sorting,
      columnFilters,
      rowSelection,
      columnOrder,
      columnPinning,
    },
  })

  useEffect(() => {
    // default one day before
    // GetMPPackage(249545)
    //   .then((res) => {
    //     const url = URL.createObjectURL(res)
    //     const a = document.createElement('a')
    //     a.href = url
    //     a.download = 'test.zip'
    //     document.body.appendChild(a)
    //     a.click()
    //     document.body.removeChild(a)
    //     URL.revokeObjectURL(url)
    //   })
    //   .catch((e) => {
    //     console.error(e)
    //   })

    const treq = { createTimeFrom: oneDayBefore, createTimeTo: moment() }
    GetMPTaskView(treq)
      .then((res) => {
        setTasks(res)
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const onDateButtonClick = (start: moment.Moment, end: moment.Moment): void => {
    setLoading(true)
    const treq = { createTimeFrom: start, createTimeTo: end }
    GetMPTaskView(treq)
      .then((res) => {
        setTasks(res)
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onLogButtonClick = (): void => {
    // get the selected rows
    const reqs: IGetDReportInfo[] = []
    const rows = table.getSelectedRowModel().rows
    for (let i = 0; i < rows.length; i++) {
      const o = rows[i].original
      if (o.TestStatusName === 'Idle') {
        continue
      }
      reqs.push({ pjId: o.PjId, tkId: o.TkId })
    }

    if (reqs.length === 0) {
      return
    }

    GetMPDRepots(reqs)
      .then((res) => {
        console.log(res)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  const onFilter = (col: Column<IMPTaskTableView, unknown>, filterValues?: any[]): void => {
    if (filterValues === undefined || filterValues.length === 0) {
      col.setFilterValue([])
      return
    }
    col.setFilterValue(filterValues)
  }

  const getTable = (isMain: boolean): JSX.Element => {
    return (
      <div className={`${isMain ? '' : 'sticky right-0 z-10 shadow-pinningTableShadow'}`}>
        <table className="border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className={`sticky z-10 top-0 text-base leading-10 font-bold bg-white px-2 text-center whitespace-nowrap border-b border-black h-12`}
                      hidden={isMain ? header.column.getIsPinned() !== false : header.column.getIsPinned() !== 'right'}
                    >
                      <div className="inline-flex items-center">
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === 'asc'
                                ? 'Sort ascending'
                                : header.column.getNextSortingOrder() === 'desc'
                                ? 'Sort descending'
                                : 'Clear sort'
                              : undefined
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                        {/* fileter */}
                        {(() => {
                          if (!header.column.getCanFilter()) {
                            return null
                          }
                          const c = table.getColumn(header.column.id)
                          if (c === undefined) {
                            return null
                          }
                          const ddData = getFilterColumnData(c)
                          return (
                            <DropdownMenu
                              onConfirm={(values: any[]) => {
                                onFilter(header.column, values)
                              }}
                              onCancel={() => {
                                onFilter(header.column)
                              }}
                              disabled={ddData.length === 0}
                              data={ddData}
                            ></DropdownMenu>
                          )
                        })()}
                        {/* sorting icons */}
                        {{
                          asc: <ArrowDropUpIcon />,
                          desc: <ArrowDropDownIcon />,
                        }[header.column.getIsSorted() as string] ?? (
                          // default icon size,
                          <ArrowDropUpIcon
                            sx={{
                              color: 'transparent',
                            }}
                          />
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, _) => (
              <tr
                key={row.id}
                className={`${row.getIsSelected() ? 'bg-indigo-100' : 'bg-white'} hover:bg-indigo-50 `}
                onDoubleClick={(e) => {
                  row.getToggleSelectedHandler()(e)
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={`border-t border-b border-gray-300 px-2 text-left bg-inherit whitespace-nowrap`}
                      hidden={isMain ? cell.column.getIsPinned() !== false : cell.column.getIsPinned() !== 'right'}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {isMain ? (
                <>
                  <td className="sticky z-20 bottom-0 text-base leading-10 font-bold bg-white px-2 text-left whitespace-nowrap">
                    <IndeterminateCheckbox
                      {...{
                        checked: table.getIsAllPageRowsSelected(),
                        indeterminate: table.getIsSomePageRowsSelected(),
                        onChange: table.getToggleAllPageRowsSelectedHandler(),
                      }}
                    />
                  </td>
                  <td
                    className="sticky z-20 bottom-0 text-base leading-10 font-bold bg-white px-2 text-left whitespace-nowrap"
                    colSpan={table.getAllColumns().length - 1}
                  >
                    Select Page Rows ({table.getRowModel().rows.length})
                  </td>
                </>
              ) : (
                <td
                  className="sticky z-20 bottom-0 text-base leading-10 font-bold px-2 text-left whitespace-nowrap bg-white text-white"
                  colSpan={table.getAllColumns().length}
                >
                  {'none'}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center w-full bg-white shadow p-2">
      {/* tool bar */}
      <ToolBar
        title="MP Task View"
        StartDate={oneDayBefore}
        EndDate={moment()}
        onDateButtonClick={(s, e) => {
          onDateButtonClick(s, e)
        }}
        onLogButtonClick={onLogButtonClick}
        defaultPinColumnIDs={defaultPinColIDs}
        pinColumnsDataSet={table.getAllColumns()}
      ></ToolBar>
      {/* loading gif */}
      {loading ? (
        <div className="relative">
          <div className="absolute top-[54px] flex justify-center items-center opacity-90 bg-gray-50  h-[500px] w-full z-20">
            <Continuous></Continuous>
          </div>
        </div>
      ) : null}
      {/* table */}
      <div className={`${style['custom-scrollbar']} overflow-auto h-[600px]`}>
        <div className="flex">
          {/* main table */}
          {getTable(true)}
          {/* right pinning table */}
          {getTable(false)}
        </div>
      </div>
      {/* pagination */}
      <Pagination table={table}></Pagination>
      {/* hint */}
      <div className="flex items-center gap-2 justify-end">
        <span>{Object.keys(rowSelection).length} Rows Selected</span>
        <span>| total records: {table.getRowCount()}</span>
      </div>
    </div>
  )
}

const IndeterminateCheckbox = ({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>): JSX.Element => {
  const ref = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current !== null && rest.checked !== undefined && typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return <input type="checkbox" ref={ref} className={className + ' cursor-pointer'} {...rest} />
}

export default MPTaskView
