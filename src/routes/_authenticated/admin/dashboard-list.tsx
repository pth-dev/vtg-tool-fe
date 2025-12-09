import { createFileRoute } from '@tanstack/react-router'

import DashboardListPage from '@/features/dashboard-designer/components/DashboardListPage'

export const Route = createFileRoute('/_authenticated/admin/dashboard-list')({
  component: DashboardListPage,
})

