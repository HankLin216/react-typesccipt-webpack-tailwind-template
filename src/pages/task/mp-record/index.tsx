import React from 'react'
import MPTaskView from './mp-task-view'
import MPLogView from './mp-log-view'
import MPRecordProvider from '../../../store/task/mp-record-provider'

const MPRecordDashboard = (): JSX.Element => {
  return (
    <MPRecordProvider>
      <MPTaskView />
      <MPLogView />
    </MPRecordProvider>
  )
}

export default MPRecordDashboard
