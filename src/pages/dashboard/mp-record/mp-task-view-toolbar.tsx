import React, { useState } from 'react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Button17 from '../../../components/button/button-17'
import type moment from 'moment'

interface ToolBarProps {
  StartDate: moment.Moment
  EndDate: moment.Moment
  onDateButtonClick: (start: moment.Moment, end: moment.Moment) => void
}

const ToolBar = (props: ToolBarProps): JSX.Element => {
  const [startDateTime, setStartDateTime] = useState<moment.Moment | null>(props.StartDate)
  const [endDateTime, setEndDateTime] = useState<moment.Moment | null>(props.EndDate)
  return (
    <div className="grid grid-cols-4 p-2">
      <div className="col-span-2">
        <h4 className="font-bold text-left pl-2 text-lg">MP Task View</h4>
      </div>
      {/* date time picker */}
      <div className="col-span-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5">
            <DateTimePicker
              label="Start At"
              slotProps={{ textField: { size: 'small' } }}
              value={startDateTime}
              onChange={(newDateTime) => {
                setStartDateTime(newDateTime)
              }}
            />
          </div>
          <div className="col-span-5">
            <DateTimePicker
              label="End At"
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
  )
}

export default ToolBar
