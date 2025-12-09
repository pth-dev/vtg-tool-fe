import { createFileRoute } from '@tanstack/react-router'

import PublicDashboardPage from '@/features/dashboard-designer/components/PublicDashboardPage'

export const Route = createFileRoute('/public/$token')({
  component: PublicDashboardPage,
})

