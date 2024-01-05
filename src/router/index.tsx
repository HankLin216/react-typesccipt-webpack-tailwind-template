import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DefaultLayout } from '../layouts'
import Home from '../pages/Home'
import About from '../pages/About'
import ErrorPage from '../pages/ErrorPage'

const Router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
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
