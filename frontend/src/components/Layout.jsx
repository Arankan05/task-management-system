import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-surface-muted">
      {/* Background depth highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/3 blur-[140px] pointer-events-none" />

      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 gap-6 relative z-10">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 gap-6">
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden spatial-main-container">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layout
