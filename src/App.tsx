import React, { useEffect } from 'react'
import Router from './router'
import { RouterProvider } from 'react-router-dom'
import './App.css'

const App = (): JSX.Element => {
  useEffect(() => {
    // add class to body element
    document.body.classList.add('bg-lightPrimary')
  }, [])

  return <RouterProvider router={Router} />
}

export default App
