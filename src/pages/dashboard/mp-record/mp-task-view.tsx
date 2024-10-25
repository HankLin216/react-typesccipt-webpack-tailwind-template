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
import DebouncedInput from '../../../components/input/debounce-input'
import moment from 'moment'
// types
import type { IMPTaskTableView } from '../../../biz/mp-record'
import type { Column, RowData, SortingState, PaginationState, ColumnFiltersState, Row } from '@tanstack/react-table'
// icons
import FilterListIcon from '@mui/icons-material/FilterList'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
// css
import style from './custom-scrollbar.module.css'
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  useEffect(() => {
    const treq = { createTimeFrom: moment().subtract(0.5, 'hours'), createTimeTo: moment() }
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
    return distinctData.sort((a, b) => (a as string).localeCompare(b as string))
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
    // sortingFns: {
    //   sortStatusFn, //or provide our custom sorting function globally for all columns to be able to use
    // },
    state: {
      pagination,
      sorting,
      columnFilters,
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
        <table>
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
                          <DropdownMenuButton
                            column={header.column}
                            disabled={ddData.length === 0}
                            data={ddData}
                            filterDebounce={100}
                          ></DropdownMenuButton>
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
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center gap-2 justify-end">
        <button
          className="border rounded p-1"
          onClick={() => {
            table.firstPage()
          }}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => {
            table.previousPage()
          }}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => {
            table.nextPage()
          }}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => {
            table.lastPage()
          }}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
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
        <span>| total records: {table.getRowCount()}</span>
      </div>
    </div>
  )
}

interface DropdownMenuButtonProps {
  data: any[]
  disabled: boolean
  column: Column<any, unknown>
  filterDebounce?: number
}

interface DropdownItem {
  value: string
  checked: boolean
}

const DropdownMenuButton = ({ data, disabled, column, filterDebounce = 500 }: DropdownMenuButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleData, setVisibleData] = useState<DropdownItem[]>(data.map((item) => ({ value: item, checked: false })))
  const [visibleCheckList, setVisibleCheckList] = useState<boolean[]>([])
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false)
  const [fileterValue, setFilterValue] = useState<string>('')

  useEffect(() => {
    // merge
    const newVisibleData = []
    const comingData = data.map((item) => ({ value: item, checked: false }))
    for (let i = 0; i < comingData.length; i++) {
      let found = false
      for (let j = 0; j < visibleData.length; j++) {
        if (comingData[i].value === visibleData[j].value) {
          found = true
          newVisibleData.push(visibleData[j])
          break
        }
      }
      if (!found) {
        newVisibleData.push(comingData[i])
      }
    }
    setVisibleData(newVisibleData)
  }, [data])

  // filter debounce
  useEffect(() => {
    console.log('trigger visibleData')
    const timeout = setTimeout(() => {
      column.setFilterValue(visibleData.filter((item) => item.checked).map((item) => item.value))
    }, filterDebounce)

    return () => {
      clearTimeout(timeout)
    }
  }, [visibleCheckList])

  const toggleMenu = (): void => {
    setIsOpen(!isOpen)
  }

  const onCheck = (idx: number): void => {
    let isAllChecked = false
    setVisibleData((pre) => {
      const newVisibleData = [...pre]
      newVisibleData[idx].checked = !newVisibleData[idx].checked
      isAllChecked = newVisibleData.every((item) => item.checked)
      // if any of the checkbox is unchecked, uncheck the "All" checkbox
      // if all of the checkbox is checked, check the "All" checkbox
      setIsAllChecked(isAllChecked)

      // update visibleCheckList
      const newVisibleCheckList = newVisibleData.map((item) => item.checked)
      setVisibleCheckList(newVisibleCheckList)

      return newVisibleData
    })
  }

  const onCheckAll = (): void => {
    setIsAllChecked((pre) => {
      return !pre
    })

    if (isAllChecked) {
      setVisibleData(visibleData.map((item) => ({ ...item, checked: false })))
    } else {
      setVisibleData(visibleData.map((item) => ({ ...item, checked: true })))
    }

    // update visibleCheckList
    const newVisibleCheckList = visibleData.map((item) => !isAllChecked)
    setVisibleCheckList(newVisibleCheckList)
  }

  const onFilter = (v: string): void => {
    setFilterValue(v)

    // update visible items, every time the filter value changes, then unchecked all
    const newVisibleData = data
      .filter((item) => (item.toLowerCase() as string).includes(v.toLowerCase()))
      .map((item) => ({ value: item, checked: false }))
    setIsAllChecked(false)
    setVisibleData(newVisibleData)

    // update visibleCheckList
    const newVisibleCheckList = newVisibleData.map((item) => item.checked)
    setVisibleCheckList(newVisibleCheckList)
  }

  return (
    <>
      <button
        disabled={disabled}
        className={`p-2.5 text-center 
        text-sm transition-all
        ${isOpen ? 'text-gray-800' : 'text-gray-400'}
        ${!disabled ? 'hover:text-gray-800' : ''}
        type="button`}
        onClick={toggleMenu}
      >
        <FilterListIcon></FilterListIcon>
      </button>
      {isOpen && (
        <ul
          role="menu"
          className={`${style['custom-scrollbar']} absolute z-10 top-12 max-w-[180px] min-h-[150px] max-h-[250px] overflow-auto border bg-white shadow-lg focus:outline-none`}
        >
          {/* filter input & all checkbox */}
          <div className="sticky top-0 z-9 bg-white px-2 pt-2">
            <DebouncedInput
              value={fileterValue}
              className="mb-1 w-full"
              onChange={(v) => {
                onFilter(v)
              }}
              debounce={500}
              placeholder="filter..."
              type="text"
            ></DebouncedInput>
            <div className="h-1 border-b-2"></div>
            {/* all */}
            <li
              role="menuitem"
              onClick={() => {
                onCheckAll()
              }}
              className="cursor-pointer flex w-full text-sm items-center p-1 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 "
            >
              <input
                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 mr-2"
                type="checkbox"
                checked={isAllChecked}
                onChange={() => {}}
              ></input>
              <label className="cursor-pointer">All</label>
            </li>
          </div>
          {/* data set .... */}
          <div className="px-2 pb-2">
            {visibleData.map((item, idx) => {
              return (
                <li
                  key={item.value}
                  role="menuitem"
                  className="cursor-pointer flex w-full text-sm items-center p-1 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 "
                  onClick={(_) => {
                    onCheck(idx)
                  }}
                >
                  <input
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 mr-2"
                    type="checkbox"
                    checked={item.checked ?? false}
                    onChange={(_) => {}}
                  ></input>
                  <label className="cursor-pointer">{item.value}</label>
                </li>
              )
            })}
          </div>
        </ul>
      )}
    </>
  )
}

export default MPTaskView
