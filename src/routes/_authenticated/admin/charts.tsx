import { createFileRoute } from '@tanstack/react-router'

import ChartListPage from '@/features/chart-builder/components/ChartListPage'

export const Route = createFileRoute('/_authenticated/admin/charts')({
  component: ChartListPage,
})

