import React from 'react'
import { Outlet } from 'react-router-dom'

function Root(): JSX.Element {
  return (
    <div>
      <h1>Layout</h1>
      <Outlet />
    </div>
  )
}

export default Root
