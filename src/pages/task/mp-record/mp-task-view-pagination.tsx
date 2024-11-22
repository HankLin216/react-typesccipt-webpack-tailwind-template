import React from 'react'
import Button17 from '../../../components/button/button-17'
// type
import type { Table } from '@tanstack/react-table'

interface PaginationProps<T> {
  table: Table<T>
}

const Pagination = <T,>({ table }: PaginationProps<T>): JSX.Element => {
  return (
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
  )
}

export default Pagination
