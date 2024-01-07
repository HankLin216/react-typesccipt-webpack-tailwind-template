import React from 'react'
import { Outlet } from 'react-router-dom'
import styles from './index.module.css'

const Layout = () => {
  return (
    <div className="container mx-auto">
      <h1 className={`text-3xl font-bold underline ${styles.test}`}>Layout LALALA1</h1>
      <Outlet />
    </div>
  )
}

export default Layout
