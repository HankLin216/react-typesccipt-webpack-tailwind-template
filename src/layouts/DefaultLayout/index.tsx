import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'

const DefaultLayout = () => {
  return (
    <div className="bg-boxdark-2 text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* Side Bar */}
        <aside className="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-boxdark">
          {/* Side Bar Header */}
          <div className="flex items-center justify-between gap-2 px-6 py-5.5">
            Header
          </div>
          {/* Side Bar Header */}
          {/* Side Bar Menu */}
          <div className="no-scrollbar flex flex-col overflow-y-auto">
            <nav className="mt-5 py-4 px-4">
              {/* <!-- Menu Group --> */}
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                MENU
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>Dashboard</li>
              </ul>
            </nav>
          </div>
          {/* Side Bar Menu */}
        </aside>
        {/* Side Bar */}
        <div className="relative"></div>
        <Outlet />
      </div>
    </div>
  )
}

export default DefaultLayout
