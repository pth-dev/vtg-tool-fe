import { Grid } from '@mui/material'

import { KpiCard } from '@/shared/components/ui'

interface KpiData {
  total_orders: number
  resume_rate: number
  failed_rate: number
  top_category: {
    name: string
    percent: number
  }
}

interface KpiSectionProps {
  kpis: KpiData
  isMobile?: boolean
}

/**
 * KPI cards section for dashboard
 */
export function KpiSection({ kpis, isMobile = false }: KpiSectionProps) {
  return (
    <Grid container spacing={isMobile ? 1.5 : 2} mb={3}>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <KpiCard title="Total Orders" value={kpis.total_orders} color="#3b82f6" />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <KpiCard title="Resume Rate" value={kpis.resume_rate} suffix="%" color="#10b981" />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <KpiCard title="Failed Rate" value={kpis.failed_rate} suffix="%" color="#ef4444" />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <KpiCard
          title="Top Category"
          value={isMobile ? kpis.top_category.name.substring(0, 15) + '...' : kpis.top_category.name}
          subtitle={`${kpis.top_category.percent}%`}
          color="#f59e0b"
        />
      </Grid>
    </Grid>
  )
}

