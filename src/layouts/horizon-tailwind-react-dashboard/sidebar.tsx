import React from 'react'
import SidebarLinks from './siderbar-links'

interface SidebarProps {
  open: boolean
  setOpen: (arg0: boolean) => void
}

const Sidebar = (props: SidebarProps) => {
  const { open, setOpen } = props

  return (
    <div
      className="sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col
       bg-white pb-10 shadow-2xl shadow-white/5 transition-all md:!z-50 lg:!z-50 xl:!z-0
       md:translate-x-0 -translate-x-96"
    >
      {/* Header */}
      <div className={`mx-[56px] mt-[50px] flex items-center`}>
        <div className="mt-1 ml-1 h-2.5 text-[26px] font-bold uppercase text-navy-700">
          Phison <span className="font-medium">TIC</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-[58px] mb-7 h-px bg-gray-300" />

      {/* Nav */}
      <ul className="mb-auto pt-1">
        <SidebarLinks></SidebarLinks>
      </ul>
    </div>
  )
}

export default Sidebar
