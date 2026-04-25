import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'
import { SidebarProvider } from '../../context/SidebarContext'

function AnimatedOutlet() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter h-full">
      <Outlet />
    </div>
  )
}

function Layout() {
  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh' }}>
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <main
          className="flex-1 overflow-y-auto md:pb-0"
          style={{ paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom, 0px), 12px))' }}
        >
          <AnimatedOutlet />
        </main>
      </div>

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
