import { lazy, ComponentType } from 'react'
import { Dashboard, Storage, People, TrackChanges, BarChart, Addchart, ViewQuilt } from '@mui/icons-material'

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const DataManagerPage = lazy(() => import('../pages/DataManagerPage'))
const ChartListPage = lazy(() => import('../pages/ChartListPage'))
const ChartBuilderPage = lazy(() => import('../pages/ChartBuilderPage'))
const DashboardListPage = lazy(() => import('../pages/DashboardListPage'))
const DashboardDesignerPage = lazy(() => import('../pages/DashboardDesignerPage'))
const PublicDashboardPage = lazy(() => import('../pages/PublicDashboardPage'))
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
    path: '/admin/data-sources',
    label: 'Data Sources',
    icon: <Storage />,
    component: DataManagerPage,
    adminOnly: true,
  },
  {
    path: '/admin/charts',
    label: 'Charts',
    icon: <BarChart />,
    component: ChartListPage,
    adminOnly: true,
  },
  {
    path: '/admin/chart-builder',
    label: 'Chart Builder',
    icon: <Addchart />,
    component: ChartBuilderPage,
    adminOnly: true,
    hideInSidebar: true,
  },
  {
    path: '/dashboard-list',
    label: 'Dashboard Designer',
    icon: <ViewQuilt />,
    component: DashboardListPage,
    adminOnly: true,
  },
  {
    path: '/dashboard-designer/:id',
    label: 'Edit Dashboard',
    icon: <ViewQuilt />,
    component: DashboardDesignerPage,
    adminOnly: true,
    hideInSidebar: true,
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: <People />,
    component: UsersPage,
    adminOnly: true,
  },
  {
    path: '/public/:token',
    label: 'Public Dashboard',
    icon: <ViewQuilt />,
    component: PublicDashboardPage,
    hideInSidebar: true,
  },
]

// Helper functions
export const getPublicItems = () => navItems.filter(item => !item.adminOnly)
export const getAdminItems = () => navItems.filter(item => item.adminOnly)
export const getSidebarItems = (isAdmin: boolean) => 
  navItems.filter(item => !item.hideInSidebar && (!item.adminOnly || isAdmin))
