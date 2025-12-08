import { Navigate, Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'
import { useAuthStore } from './stores/authStore'
import { getPublicItems, getAdminItems } from './config/navigation'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/layout/AppLayout'

function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/" />
  return <Outlet />
}

const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress />
  </Box>
)

// Auto-generate routes from config
const publicRoutes = getPublicItems().map(item => ({
  path: item.path,
  element: <Suspense fallback={<Loading />}><item.component /></Suspense>
}))

const adminRoutes = getAdminItems().map(item => ({
  path: item.path,
  element: <Suspense fallback={<Loading />}><item.component /></Suspense>
}))

export const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      ...publicRoutes,
      {
        element: <AdminRoute />,
        children: adminRoutes,
      },
    ],
  },
]
