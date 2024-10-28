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
import { GetMPTaskView } from '../../../biz/mp-record'
import moment from 'moment'
import Button17 from '../../../components/button/button-17'
import DropdownMenu from './mp-task-view-dropdown-menu'
// types
import type { HTMLProps } from 'react'
import type { IMPTaskTableView } from '../../../biz/mp-record'
import type { Column, RowData, SortingState, PaginationState, ColumnFiltersState, Row, Table } from '@tanstack/react-table'
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
    header: () => 'Project ID',
    cell: (info) => info.getValue(),
    meta: {
      filterVariant: 'text',
    },
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.ForcePcieFlowName, {
    id: 'ForcePcieFlowName',
    header: 'Force PCIe Flow',
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
    header: 'User Name',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.IP, { id: 'Ip', header: 'IP', cell: (info) => info.getValue(), filterFn: ContainInArray }),
  columnHelper.accessor((props) => props.ControllerID, {
    id: 'ControllerID',
    header: 'Controller ID',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.IC, { id: 'Ic', header: 'IC', cell: (info) => info.getValue(), filterFn: ContainInArray }),
  columnHelper.accessor((props) => props.FwVersion, {
    id: 'FwVersion',
    header: 'Fw Version',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.FwSubVersion, {
    id: 'FwSubVersion',
    header: 'Fw Subversion',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.MpErrorCode, {
    id: 'MpErrorCode',
    header: 'Error Code',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.MpResultName, {
    id: 'MpResultName',
    header: 'MP Result',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.MpEnvironmentName, {
    id: 'MpEnvironmentName',
    header: 'Environment',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.TkId, {
    id: 'TkId',
    header: 'Task ID',
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
  columnHelper.accessor((props) => props.IdleStartTime, {
    id: 'IdleStartTime',
    header: 'Build At',
    cell: (info) => info.getValue(),
    enableColumnFilter: false,
  }),
  columnHelper.accessor((props) => props.PrepareStartTime, {
    id: 'PrepareStartTime',
    header: 'Start At',
    cell: (info) => info.getValue(),
    enableColumnFilter: false,
  }),
  columnHelper.accessor((props) => props.TestEndTime, {
    id: 'TestEndTime',
    header: 'End At',
    cell: (info) => info.getValue(),
    enableColumnFilter: false,
  }),
  columnHelper.accessor((props) => props.ToolName, {
    id: 'ToolName',
    header: 'Tool Name',
    cell: (info) => info.getValue(),
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
    cell: (info) => info.getValue(),
    filterFn: ContainInArray,
  }),
]

const MPTaskView = (): JSX.Element => {
  const [tasks, setTasks] = useState<IMPTaskTableView[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    const treq = { createTimeFrom: moment().subtract(3, 'days'), createTimeTo: moment() }
    GetMPTaskView(treq)
      .then((res) => {
        setTasks(res)
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])

  const getColumnData = (columnId: string): any[] => {
    const column = table.getColumn(columnId)
    if (column !== undefined) {
      return column.getFacetedRowModel().rows.map((row) => row.getValue(columnId))
    }
    return []
  }

  const getFilterColumnData = (columnId: string): any[] => {
    const data = getColumnData(columnId)
    if (data.length === 0) {
      return []
    }
    // distinct
    const distinctData = [...new Set(data)]
    // tidy up
    for (let i = 0; i < distinctData.length; i++) {
      if (distinctData[i] === null || distinctData[i] === undefined) {
        distinctData[i] = 'null'
      }

      if (distinctData[i] === '') {
        distinctData[i] = 'empty'
      }
    }

    // sort
    return distinctData.sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b)
      }

      if (typeof a === 'number' && typeof b === 'number') {
        return a - b
      }

      return 0
    })
  }

  const onFilter = (col: Column<IMPTaskTableView, unknown>, filterValues?: any[]): void => {
    if (filterValues === undefined || filterValues.length === 0) {
      col.setFilterValue([])
      return
    }
    col.setFilterValue(filterValues)
  }

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
    // sortingFns: {
    //   sortStatusFn, //or provide our custom sorting function globally for all columns to be able to use
    // },
    state: {
      pagination,
      sorting,
      columnFilters,
      rowSelection,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering - default on/true
    // enableMultiSort: false, // Don't allow shift key to sort multiple columns - default on/true
    // enableSorting: false, // - default on/true
    // enableSortingRemoval: false, //Don't allow - default on/true
    // isMultiSortEvent: (e) => true, //Make all clicks multi-sort - default requires `shift` key
    // maxMultiSortColCount: 3, // only allow 3 columns to be sorted at once - default is Infinity
  })

  return (
    <div className="flex flex-col justify-center w-11/12">
      <div className={`${style['custom-scrollbar']} overflow-auto h-[560px]`}>
        <table className={`h-full`}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="sticky z-10 top-0 text-base leading-10 font-bold bg-white px-4 text-center whitespace-nowrap"
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
                        const ddData = getFilterColumnData(header.column.id)
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
          <tfoot>
            <tr className="sticky bottom-0 bg-white">
              <td className="border-t border-b border-gray-300 px-4 text-left">
                <IndeterminateCheckbox
                  {...{
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate: table.getIsSomePageRowsSelected(),
                    onChange: table.getToggleAllPageRowsSelectedHandler(),
                  }}
                />
              </td>
              <td className="border-t border-b border-gray-300 px-4 text-left" colSpan={table.getAllColumns().length - 1}>
                Select Page Rows ({table.getRowModel().rows.length})
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center gap-2 justify-end">
        <Button17
          onClick={() => {
            table.firstPage()
          }}
          disabled={!table.getCanPreviousPage()}
          text="<<"
        ></Button17>
        <Button17
          onClick={() => {
            table.previousPage()
          }}
          disabled={!table.getCanPreviousPage()}
          text="<"
        ></Button17>
        <Button17
          onClick={() => {
            table.nextPage()
          }}
          disabled={!table.getCanNextPage()}
          text=">"
        ></Button17>
        <Button17
          onClick={() => {
            table.lastPage()
          }}
          disabled={!table.getCanNextPage()}
          text=">>"
        ></Button17>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value !== null ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <span className="flex items-center gap-1">
          | Page Size:
          {(() => {
            const pslist = [10, 20, 30, 40, 50, table.getRowCount()]
            return (
              <select
                value={table.getState().pagination.pageSize >= table.getRowCount() ? 'All' : table.getState().pagination.pageSize}
                onChange={(e) => {
                  if (e.target.value === 'All') {
                    table.setPageSize(table.getRowCount())
                    return
                  }
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {pslist.map((pageSize, idx) => {
                  if (pageSize === table.getRowCount() && idx === pslist.length - 1) {
                    return <option key={`ps-${pageSize}-all`} value={'All'}>{`All`}</option>
                  }
                  return (
                    <option key={`ps-${pageSize}`} value={pageSize}>
                      {pageSize}
                    </option>
                  )
                })}
              </select>
            )
          })()}
        </span>
      </div>
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
