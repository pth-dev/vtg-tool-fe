import { lazy, ComponentType } from 'react'
import { Dashboard, Storage, People, TrackChanges } from '@mui/icons-material'

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const DataSourcesPage = lazy(() => import('../pages/DataSourcesPage'))
const UsersPage = lazy(() => import('../pages/UsersPage'))
const IscDoTrackingPage = lazy(() => import('../pages/IscDoTrackingPage'))

export interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  component: ComponentType
  adminOnly?: boolean
  hideInSidebar?: boolean
}

/**
 * SINGLE SOURCE OF TRUTH
 * Thêm feature mới chỉ cần thêm 1 entry ở đây
 */
export const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: <Dashboard />,
    component: DashboardPage,
  },
    {
    path: '/isc-do-tracking',
    label: 'ISC - DO Tracking',
    icon: <TrackChanges />,
    component: IscDoTrackingPage,
  },
  {
    path: '/admin/datasources',
    label: 'Data Management',
    icon: <Storage />,
    component: DataSourcesPage,
    adminOnly: true,
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: <People />,
    component: UsersPage,
    adminOnly: true,
  },
]

// Helper functions
export const getPublicItems = () => navItems.filter(item => !item.adminOnly)
export const getAdminItems = () => navItems.filter(item => item.adminOnly)
export const getSidebarItems = (isAdmin: boolean) => 
  navItems.filter(item => !item.hideInSidebar && (!item.adminOnly || isAdmin))
