import React, { useEffect, useRef } from 'react'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (arg: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const sidebar = useRef<any>(null)

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current) return
      if (!sidebarOpen || sidebar.current.contains(target)) return
      setSidebarOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-black lg:static lg:translate-x-0`}
    >
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
  )
}

export default Sidebar
