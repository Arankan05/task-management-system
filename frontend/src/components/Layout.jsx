import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-surface-muted">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout
