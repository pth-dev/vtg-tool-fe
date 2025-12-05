import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DataSourcesPage from './pages/DataSourcesPage'
import UsersPage from './pages/UsersPage'
import AppLayout from './components/layout/AppLayout'

function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/" />
  return <Outlet />
}

export const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      {
        element: <AdminRoute />,
        children: [
          { path: '/admin/datasources', element: <DataSourcesPage /> },
          { path: '/admin/users', element: <UsersPage /> },
        ],
      },
    ],
  },
]
