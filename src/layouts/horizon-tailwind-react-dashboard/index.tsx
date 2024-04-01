import React, { useState } from 'react'
import Sidebar from './sidebar'
import NavigationBar from './navigation-bar'
import Footer from './footer'
import { Outlet } from 'react-router-dom'

const HorizonTailwindReactAdmin = (): JSX.Element => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Navbar & Main Content */}
      <div className="h-full w-full bg-lightPrimary">
        {/* Main Content */}
        <main className={`mx-[12px] h-full flex-none transition-all md:pr-2 md:ml-[313px]`}>
          <div className="h-full">
            {/* Nav Bar */}
            <NavigationBar />
            {/* Content */}
            <div className="pt-5 mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Outlet />
            </div>
            {/* Footer */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}

export default HorizonTailwindReactAdmin
