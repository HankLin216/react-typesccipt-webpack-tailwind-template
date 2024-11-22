import React, { useState } from 'react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Button17 from '../../../components/button/button-17'
import DropdownMenu from './mp-task-view-dropdown-menu'
// types
import type moment from 'moment'
import type { Column } from '@tanstack/react-table'
import type { DropdownItem } from './mp-task-view-dropdown-menu'
// icons
import PushPinIcon from '@mui/icons-material/PushPin'

interface ToolBarProps<T> {
  title: string
  StartDate: moment.Moment
  EndDate: moment.Moment
  onDateButtonClick: (start: moment.Moment, end: moment.Moment) => void
  defaultPinColumnIDs?: string[]
  pinColumnsDataSet?: Array<Column<T, unknown>>
  onLogButtonClick?: () => void
}

const ToolBar = <T,>(props: ToolBarProps<T>): JSX.Element => {
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(props.StartDate)
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(props.EndDate)

  const getColumnHeaderName = (d: Column<T, unknown>): string => {
    if (d.columnDef.header === undefined) {
      return ''
    }
    if (typeof d.columnDef.header === 'function') {
      return ''
    }
    const hn = d.columnDef.header?.toString()
    if (hn === undefined) {
      return ''
    }
    return hn
  }

  const covert2DropdownItem = (defaultPinColumnIDs: string[], ds: Array<Column<T, unknown>>): DropdownItem[] => {
    const ret: DropdownItem[] = []
    for (let i = 0; i < ds.length; i++) {
      const hn = getColumnHeaderName(ds[i])
      if (hn === '') {
        continue
      }

      const d: DropdownItem = {
        label: hn,
        value: ds[i].columnDef.id ?? '',
        checked: false,
      }
      if (defaultPinColumnIDs.includes(d.value)) {
        d.checked = true
      }
      ret.push(d)
    }

    return ret
  }

  const onCancelAllPin = (pinColumnsDataSet: Array<Column<T, unknown>>): void => {
    if (pinColumnsDataSet === undefined) {
      return
    }
    // reset the pin
    for (let i = 0; i < pinColumnsDataSet.length; i++) {
      pinColumnsDataSet[i].pin(false)
    }
  }

  const onPinConfirm = (currPinList: string[], pinColumnsDataSet: Array<Column<T, unknown>>): void => {
    if (pinColumnsDataSet === undefined) {
      return
    }
    if (currPinList.length === 0) {
      onCancelAllPin(pinColumnsDataSet)
    }

    for (let i = 1; i < pinColumnsDataSet.length; i++) {
      // cancel pin
      if (pinColumnsDataSet[i].getIsPinned() !== false) {
        if (!currPinList.includes(pinColumnsDataSet[i].id)) {
          pinColumnsDataSet[i].pin(false)
        }
      }

      // pin
      if (pinColumnsDataSet[i].getIsPinned() === false) {
        if (currPinList.includes(pinColumnsDataSet[i].id)) {
          pinColumnsDataSet[i].pin('right')
        }
      }
    }
  }

  return (
    <div>
      {/* first row */}
      <div className="p-2 flex justify-between">
        {/* title */}
        <div>
          <h4 className="font-bold text-left pl-2 text-lg">{props.title}</h4>
        </div>
        <div>
          {/* pin */}
          {props.pinColumnsDataSet !== undefined && (
            <DropdownMenu
              position="left"
              data={covert2DropdownItem(props.defaultPinColumnIDs ?? [], props.pinColumnsDataSet ?? [])}
              disabled={false}
              onCancel={() => {
                onCancelAllPin(props.pinColumnsDataSet ?? [])
              }}
              onConfirm={(fvs) => {
                onPinConfirm(fvs, props.pinColumnsDataSet ?? [])
              }}
              icon={<PushPinIcon />}
              onActivateIcon={<PushPinIcon className="-rotate-45" />}
            ></DropdownMenu>
          )}
        </div>
      </div>
      {/* sec row */}
      <div className="grid grid-cols-4">
        <div className="col-span-2">
          <div className="grid grid-cols-12 gap-2 h-full">
            {/* log */}
            {props.onLogButtonClick !== undefined && (
              <div className="col-span-2">
                <Button17 text="Log" onClick={props.onLogButtonClick} className="w-[80%] h-[80%] font-bold rounded-none"></Button17>
              </div>
            )}
          </div>
        </div>
        {/* date time picker */}
        <div className="col-span-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <DateTimePicker
                label="Create From"
                slotProps={{ textField: { size: 'small' } }}
                value={startDateTime}
                onChange={(newDateTime) => {
                  setStartDateTime(newDateTime)
                }}
              />
            </div>
            <div className="col-span-5">
              <DateTimePicker
                label="Create To"
                slotProps={{ textField: { size: 'small' } }}
                value={endDateTime}
                onChange={(newDateTime) => {
                  setEndDateTime(newDateTime)
                }}
              />
            </div>
            <div className="col-span-2 flex items-center">
              <Button17
                className="w-[80%] h-[80%] font-bold rounded-none"
                text="GO!"
                onClick={() => {
                  if (startDateTime != null && endDateTime != null) {
                    props.onDateButtonClick(startDateTime, endDateTime)
                  }
                }}
              ></Button17>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolBar
