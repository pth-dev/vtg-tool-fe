import { createFileRoute } from '@tanstack/react-router'

import ChartBuilderPage from '@/features/chart-builder/components/ChartBuilderPage'

export const Route = createFileRoute('/_authenticated/admin/chart-builder')({
  component: ChartBuilderPage,
})

