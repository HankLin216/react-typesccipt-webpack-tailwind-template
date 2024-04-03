import React from 'react'
import SwitchToolAmountChart from './switch-tool-amount-chart'
import PPS2MultiSinglePortChart from './pps2-multi-single-port-chart'

const Dashboard = (): JSX.Element => {
  return (
    <div style={{ border: '1px solid red' }}>
      <div style={{ border: '1px solid blue' }}>
        <SwitchToolAmountChart></SwitchToolAmountChart>
      </div>
      <div style={{ border: '1px solid green' }}>
        <PPS2MultiSinglePortChart></PPS2MultiSinglePortChart>
      </div>
    </div>
  )
}

export default Dashboard
