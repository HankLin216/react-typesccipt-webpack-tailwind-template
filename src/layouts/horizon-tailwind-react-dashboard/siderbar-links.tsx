import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InfoIcon from '@mui/icons-material/Info'

interface MainLinkType {
  name: string
  path: string
  icon: JSX.Element
}

const mainLinks: MainLinkType[] = [
  {
    name: 'About',
    path: 'About',
    icon: <InfoIcon className="h-6 w-6"></InfoIcon>,
  },
  {
    name: 'Dashboard',
    path: 'dashboard',
    icon: <DashboardIcon className="h-6 w-6"></DashboardIcon>,
  },
]

export const SidebarLinks = (): JSX.Element => {
  // Chakra color mode
  let location = useLocation()

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName)
  }

  const createLinks = () => {
    return mainLinks.map((route, index) => {
      return (
        <Link key={index} to={route.path}>
          <div className="relative mb-3 flex hover:cursor-pointer">
            <li className="my-[3px] flex cursor-pointer items-center px-8" key={index}>
              <span
                className={`${
                  activeRoute(route.path) === true ? 'font-bold text-brand-500' : 'font-medium text-gray-600'
                }`}
              >
                {route.icon}
              </span>
              <p
                className={`leading-1 ml-4 flex ${
                  activeRoute(route.path) === true ? 'font-bold text-navy-700' : 'font-medium text-gray-600'
                }`}
              >
                {route.name}
              </p>
            </li>
            {activeRoute(route.path) === true ? (
              <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500" />
            ) : null}
          </div>
        </Link>
      )
    })
  }

  // BRAND
  return <>{createLinks()}</>
}
export default SidebarLinks
