import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import type RouteObject from 'react-router-dom'
import { HorizonTailwindReactAdmin } from '../layouts'
import Home from '../pages/home'
import About from '../pages/about'
import Dashboard from '../pages/dashboard/misc'
import MPRecordDashboard from '../pages/dashboard/mp-record'
import ErrorPage from '../pages/error-page'
// icons
import InfoIcon from '@mui/icons-material/Info'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'

export interface IMainLinkType {
  name: string
  path?: string
  icon: JSX.Element
  element?: JSX.Element
  sublinks?: ISubLinkType[]
}
export interface ISubLinkType {
  name: string
  path: string
  element: JSX.Element
  icon: JSX.Element
}

const NavLinks: IMainLinkType[] = [
  {
    name: 'About',
    path: '/about',
    icon: <InfoIcon></InfoIcon>,
    element: <About />,
  },
  {
    name: 'Dashboard',
    icon: <ExpandMoreIcon></ExpandMoreIcon>,
    sublinks: [
      {
        name: 'Misc',
        path: '/dashboard/misc',
        element: <Dashboard />,
        icon: <MiscellaneousServicesIcon></MiscellaneousServicesIcon>,
      },
      {
        name: 'MP Record',
        path: '/dashboard/mp-record',
        element: <MPRecordDashboard />,
        icon: <SpaceDashboardIcon></SpaceDashboardIcon>,
      },
    ],
  },
]

const convertMainLinksToRoutes = (links: IMainLinkType[]): RouteObject.RouteObject[] => {
  const routes: RouteObject.RouteObject[] = []

  links.forEach((link, _) => {
    if (link.sublinks !== undefined) {
      const c = link.sublinks.map((sublink) => {
        return {
          path: sublink.path,
          element: sublink.element,
        }
      })

      routes.push({
        element: link.element,
        children: c,
      })
    } else {
      routes.push({
        path: link.path,
        element: link.element,
      })
    }
  })
  return routes
}

const Router = createBrowserRouter([
  {
    path: '/',
    element: <HorizonTailwindReactAdmin />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      ...convertMainLinksToRoutes(NavLinks),
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

export { Router, NavLinks }
