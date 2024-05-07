import React from 'react'
import SwitchToolAmountChart from './switch-tool-amount-chart'
import PPS2MultiSinglePortChart from './pps2-multi-single-port-chart'
import MpCountChart from './mp-count-chart'

const Dashboard = (): JSX.Element => {
  return (
    <div>
      <div>
        <SwitchToolAmountChart></SwitchToolAmountChart>
      </div>
      <div>
        <PPS2MultiSinglePortChart></PPS2MultiSinglePortChart>
      </div>
      <div>
        <MpCountChart></MpCountChart>
      </div>
    </div>
  )
}

export default Dashboard
