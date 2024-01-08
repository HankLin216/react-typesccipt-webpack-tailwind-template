import React from 'react'
import { Link } from 'react-router-dom'

const NavigationBar = () => {
  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a className="text-sm font-normal text-navy-700 hover:underline" href=" ">
            Pages
            <span className="ml-l text-sm text-navy-700 hover:text-navy-700"> / </span>
          </a>
          <Link className="text-sm font-normal capitalize text-navy-700 hover:underline" to="#">
            TEST
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700">
          <Link to="#" className="font-bold capitalize hover:text-navy-700">
            TEST
          </Link>
        </p>
      </div>
    </nav>
  )
}

export default NavigationBar
