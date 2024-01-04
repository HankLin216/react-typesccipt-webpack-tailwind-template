import React from 'react'
import Router from './router'
import { RouterProvider } from 'react-router-dom'
import './App.css'

const App = (): JSX.Element => {
  return <RouterProvider router={Router} />
}

export default App
