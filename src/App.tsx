import React from 'react'
import styles from './App.module.css'
import Router from './router'
import { RouterProvider } from 'react-router-dom'

const App = (): JSX.Element => {
  return <RouterProvider router={Router} />
}

export default App
