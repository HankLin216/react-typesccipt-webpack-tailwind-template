import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { IMainLinkType, ISubLinkType } from '../../router'
import { NavLinks } from '../../router'

function initExpandLinkMap(currPath: string): Record<string, boolean> {
  const map: Record<string, boolean> = {}

  for (const link of NavLinks) {
    if (link.sublinks === undefined) {
      continue
    }

    map[link.name] = false
    for (const sublink of link.sublinks) {
      if (currPath.includes(sublink.path)) {
        map[link.name] = true
        break
      }
    }
  }
  return map
}

function initNavLinkMap(currPath: string): Record<string, boolean> {
  const map: Record<string, boolean> = {}

  for (const link of NavLinks) {
    if (link.path === undefined) {
      if (link.sublinks === undefined) {
        continue
      }

      for (const sublink of link.sublinks) {
        if (currPath.includes(sublink.path)) {
          map[sublink.name] = true
          continue
        }
        map[sublink.name] = false
      }
    } else {
      if (currPath.includes(link.path)) {
        map[link.name] = true
      } else {
        map[link.name] = false
      }
    }
  }
  return map
}

export const SidebarLinks = (): JSX.Element => {
  const location = useLocation()

  const [expandLinkActiveMap, setExpandLinkActiveMap] = useState<Record<string, boolean>>(initExpandLinkMap(location.pathname))
  const [navLinkActiveMap, setNavActiveMap] = useState<Record<string, boolean>>(initNavLinkMap(location.pathname))

  const setExpandLinkActive = (name: string): void => {
    setExpandLinkActiveMap({ ...expandLinkActiveMap, [name]: !expandLinkActiveMap[name] })
  }

  const setNavLinkActive = (route: IMainLinkType | ISubLinkType): void => {
    if (route.path === undefined) {
      return
    }

    if (location.pathname.includes(route.path)) {
      return
    }

    const newMap: Record<string, boolean> = {}
    for (const key in navLinkActiveMap) {
      newMap[key] = false
    }

    setNavActiveMap({
      ...newMap,
      [route.name]: !navLinkActiveMap[route.name],
    })
  }

  const activeRoute = (route: IMainLinkType | ISubLinkType): boolean => {
    if (route.path !== undefined) {
      return navLinkActiveMap[route.name]
    }

    return expandLinkActiveMap[route.name]
  }

  const createLinks = (): JSX.Element[] => {
    const navs: JSX.Element[] = []
    NavLinks.forEach((route, index) => {
      if (route.sublinks === undefined) {
        if (route.path === undefined) return
        navs.push(
          <Link
            key={index}
            to={route.path}
            onClick={() => {
              setNavLinkActive(route)
            }}
          >
            <div className="relative mb-3 flex hover:cursor-pointer">
              <div className="my-[3px] flex cursor-pointer items-center px-8" key={index}>
                <span className={`${activeRoute(route) ? 'font-bold text-brand-500' : 'font-medium text-gray-600'}`}>{route.icon}</span>
                <p className={`leading-5 ml-4 flex ${activeRoute(route) ? 'font-bold text-navy-700' : 'font-medium text-gray-600'}`}>
                  {route.name}
                </p>
              </div>
              {activeRoute(route) ? <div className="absolute right-0 -top-0.5 h-9 w-1 rounded-lg bg-brand-500" /> : null}
            </div>
          </Link>
        )
      } else {
        navs.push(
          <React.Fragment key={index}>
            <div
              className="relative mb-3 flex hover:cursor-pointer"
              onClick={() => {
                setExpandLinkActive(route.name)
              }}
            >
              <div className="my-[3px] flex cursor-pointer items-center px-8" key={index}>
                <span className={`transition-all font-bold text-navy-700 ${!activeRoute(route) ? '-rotate-90' : ''}`}>{route.icon}</span>
                <p className={'leading-5 ml-4 flex font-bold text-gray-900'}>{route.name}</p>
              </div>
            </div>
            <div className={`transition-all ease-in-out duration-300 overflow-hidden ${activeRoute(route) ? 'max-h-64' : 'max-h-0'}`}>
              {route.sublinks.map((sublink, subIndex) => {
                return (
                  <Link
                    key={`${index}-${subIndex}`}
                    to={sublink.path}
                    onClick={() => {
                      setNavLinkActive(sublink)
                    }}
                  >
                    <div className="relative mb-3 flex hover:cursor-pointer">
                      <div className="my-[3px] flex cursor-pointer items-center pl-14" key={index}>
                        <span className={`${activeRoute(sublink) ? 'font-bold text-brand-500' : 'font-medium text-gray-600'}`}>
                          {sublink.icon}
                        </span>
                        <p
                          className={`leading-3 ml-4 flex text-base ${
                            activeRoute(sublink) ? 'font-bold text-navy-700' : 'font-medium text-gray-600'
                          }`}
                        >
                          {sublink.name}
                        </p>
                      </div>
                      {activeRoute(sublink) ? <div className="absolute right-0 top-px h-6 w-1 rounded-lg bg-brand-500" /> : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          </React.Fragment>
        )
      }
    })

    return navs
  }

  // BRAND
  return <>{createLinks()}</>
}
export default SidebarLinks
