import React, { useEffect } from 'react'
import { Router } from './router'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { RouterProvider } from 'react-router-dom'
import './App.css'

const App = (): JSX.Element => {
  useEffect(() => {
    // add class to body element
    document.body.classList.add('bg-lightPrimary')
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <RouterProvider router={Router} />
    </LocalizationProvider>
  )
}

export default App
