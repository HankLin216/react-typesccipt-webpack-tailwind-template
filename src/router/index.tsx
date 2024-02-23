import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { HorizonTailwindReactAdmin } from '../layouts'
import Home from '../pages/home'
import About from '../pages/about'
import Dashboard from '../pages/dashboard'
import ErrorPage from '../pages/error-page'

const Router = createBrowserRouter([
  {
    path: '/',
    element: <HorizonTailwindReactAdmin />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/about',
        children: [
          {
            index: true,
            element: <About />,
          },
          {
            path: '/about/me',
            element: <div>About me</div>,
          },
        ],
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: '/other-entry',
    element: <div>other-entry</div>,
  },
])

export default Router
