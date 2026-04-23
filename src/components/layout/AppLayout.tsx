import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'
import { SidebarProvider } from '../../context/SidebarContext'

function Layout() {
  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh' }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto md:pb-0" style={{ paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom, 0px), 12px))' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile menu — mobile only */}
      <MobileMenu />
    </div>
  )
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Layout />
    </SidebarProvider>
  )
}
