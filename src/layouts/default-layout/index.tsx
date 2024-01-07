import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './side-bar'
import Header from './header'

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-boxdark-2 text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* Side Bar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Side Bar */}
        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Header */}
          {/* Main Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4">
              <Outlet />
            </div>
          </main>
          {/* Main Content */}
        </div>
        {/* Content Area */}
      </div>
    </div>
  )
}

export default DefaultLayout
