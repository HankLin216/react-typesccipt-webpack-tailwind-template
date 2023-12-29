import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root'
import ErrorPage from './routes/error_page'
import styles from './index.module.css'

const App = (): JSX.Element => {
  return <div className={styles.textColor}>Hello, world! Debug!!!!!!~~</div>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: '/about',
        children: [
          {
            index: true,
            element: <div>About</div>,
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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLInputElement
)

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
