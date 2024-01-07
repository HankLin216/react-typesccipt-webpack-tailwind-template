import React, { useState } from 'react'
import Sidebar from './sidebar'
import { Outlet } from 'react-router-dom'

const HorizonTailwindReactAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-dvh w-full">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="h-full w-full bg-lightPrimary">
        <main className={`mx-[12px] h-full flex-none transition-all md:pr-2 sm:ml-[313px]`}>
          <div className="h-full">
            {/* Nav Bar */}
            {/* Content */}
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              https://github.com/horizon-ui/horizon-tailwind-react-ts/blob/main/src/routes.tsx
              <Outlet></Outlet>
            </div>
            {/* Footer */}
          </div>
        </main>
      </div>
    </div>
  )
}

export default HorizonTailwindReactAdmin
