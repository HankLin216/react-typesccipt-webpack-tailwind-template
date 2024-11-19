import React, { useState } from 'react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Button17 from '../../../components/button/button-17'
import DropdownMenu from './mp-task-view-dropdown-menu'
// types
import type moment from 'moment'
import type { Column } from '@tanstack/react-table'
// icons
import PushPinIcon from '@mui/icons-material/PushPin'

interface ToolBarProps<T> {
  title: string
  StartDate: moment.Moment
  EndDate: moment.Moment
  onDateButtonClick: (start: moment.Moment, end: moment.Moment) => void
  defaultPinColumnIDs?: string[]
  pinColumnsDataSet?: Array<Column<T, unknown>>
}

const ToolBar = <T,>(props: ToolBarProps<T>): JSX.Element => {
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(props.StartDate)
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(props.EndDate)

  const extractTheColumnHeaderNameList = (ds: Array<Column<T, unknown>>): string[] => {
    const ret: string[] = []
    for (let i = 0; i < ds.length; i++) {
      if (!ds[i].getCanPin()) {
        continue
      }
      if (ds[i].columnDef.header === undefined) {
        continue
      }
      if (typeof ds[i].columnDef.header === 'function') {
        continue
      }
      const hn = ds[i].columnDef.header?.toString()
      if (hn === undefined) {
        continue
      }
      ret.push(hn)
    }

    return ret
  }

  const convert2ColumnHeaderName = (id: string, ds: Array<Column<T, unknown>>): string => {
    for (let i = 0; i < ds.length; i++) {
      if (!ds[i].getCanPin()) {
        continue
      }
      if (ds[i].columnDef.header === undefined) {
        continue
      }
      if (typeof ds[i].columnDef.header === 'function') {
        continue
      }
      if (ds[i].columnDef.id !== id) {
        continue
      }
      const hn = ds[i].columnDef.header?.toString()
      if (hn === undefined) {
        continue
      }
      return hn
    }
    return ''
  }

  const getHeaderNameList = (ids: string[], ds: Array<Column<T, unknown>>): string[] => {
    const ret: string[] = []
    for (let i = 0; i < ids.length; i++) {
      const hn = convert2ColumnHeaderName(ids[i], ds)
      if (hn !== '') {
        ret.push(hn)
      }
    }

    return ret
  }

  const pin = (headerName: string[], pinColumnsDataSet: Array<Column<T, unknown>>): void => {
    for (let i = 0; i < headerName.length; i++) {
      for (let j = 0; j < pinColumnsDataSet.length; j++) {
        const header = pinColumnsDataSet[j].columnDef?.header
        if (header !== undefined && typeof header !== 'function' && header.toString() === headerName[i]) {
          pinColumnsDataSet[j].pin('right')
        }
      }
    }
  }

  const onPinCancel = (pinColumnsDataSet: Array<Column<T, unknown>>): void => {
    if (pinColumnsDataSet === undefined) {
      return
    }
    // reset the pin
    for (let i = 0; i < pinColumnsDataSet.length; i++) {
      pinColumnsDataSet[i].pin(false)
    }
  }

  const onPinConfirm = (filterValueList: string[], pinColumnsDataSet: Array<Column<T, unknown>>): void => {
    if (pinColumnsDataSet === undefined) {
      return
    }
    if (filterValueList.length === 0) {
      onPinCancel(pinColumnsDataSet)
    }
    // cancel pin
    for (let i = 1; i < pinColumnsDataSet.length; i++) {
      if (pinColumnsDataSet[i].getIsPinned() !== false) {
        const hn = extractTheColumnHeaderNameList([pinColumnsDataSet[i]])
        if (hn.length !== 0 && !filterValueList.includes(hn[0])) {
          pinColumnsDataSet[i].pin(false)
        }
      }
    }
    pin(filterValueList, pinColumnsDataSet)
  }

  return (
    <div>
      {/* first row */}
      <div className="grid grid-cols-12 p-2">
        <div className="col-span-2">
          <h4 className="font-bold text-left pl-2 text-lg">{props.title}</h4>
        </div>
      </div>
      {/* sec row */}
      <div className="grid grid-cols-4">
        <div className="col-span-2">
          <div className="grid grid-cols-12 gap-2 h-full">
            {props.pinColumnsDataSet !== undefined && (
              <div className="col-span-2">
                <DropdownMenu
                  initialCheckedData={getHeaderNameList(props.defaultPinColumnIDs ?? [], props.pinColumnsDataSet)}
                  data={extractTheColumnHeaderNameList(props.pinColumnsDataSet)}
                  disabled={false}
                  onCancel={() => {
                    onPinCancel(props.pinColumnsDataSet ?? [])
                  }}
                  onConfirm={(fvs) => {
                    onPinConfirm(fvs, props.pinColumnsDataSet ?? [])
                  }}
                  icon={<PushPinIcon />}
                  onActivateIcon={<PushPinIcon className="-rotate-45" />}
                ></DropdownMenu>
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
