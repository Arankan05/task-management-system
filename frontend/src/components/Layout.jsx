import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import useSocket from '../hooks/useSocket'

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  useSocket()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-surface-muted">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
