import { createFileRoute } from '@tanstack/react-router'

import DashboardDesignerPage from '@/features/dashboard-designer/components/DashboardDesignerPage'

export const Route = createFileRoute('/_authenticated/admin/dashboard-designer/$id')({
  component: DashboardDesignerPage,
})

