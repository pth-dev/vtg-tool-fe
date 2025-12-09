import { useMemo } from 'react'

import { RouterProvider } from '@tanstack/react-router'

import { router } from './app/router'
import { useAuthStore } from './features/auth'

export default function App() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const auth = useMemo(
    () => ({
      isAuthenticated: !!token,
      isAdmin: user?.role === 'admin',
    }),
    [token, user]
  )

  return <RouterProvider router={router} context={{ auth }} />
}
