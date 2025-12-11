import { Grid } from '@mui/material'

import { KpiCard } from '@/shared/components/ui'

interface KpiData {
  total_orders: number
  lock_count?: number
  hold_count?: number
  failure_count?: number
  resume_success_rate?: number
  hold_rate?: number
  failure_rate?: number
}

interface MomChange {
  total_orders?: number | null
  lock_count?: number | null
  hold_count?: number | null
  failure_count?: number | null
  resume_success_rate?: number | null
  failure_rate?: number | null
}

interface KpiSectionProps {
  kpis: KpiData
  momChange?: MomChange
  isMobile?: boolean
}

export function KpiSection({ kpis, momChange, isMobile = false }: KpiSectionProps) {
  return (
    <Grid container spacing={isMobile ? 1.5 : 2} mb={3}>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Total Orders" 
          value={kpis.total_orders} 
          color="#3b82f6"
          change={momChange?.total_orders}
          changeType="percent"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Lock" 
          value={kpis.lock_count || 0} 
          color="#8b5cf6"
          change={momChange?.lock_count}
          changeType="percent"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Hold" 
          value={kpis.hold_count || 0} 
          color="#f59e0b"
          change={momChange?.hold_count}
          changeType="percent"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Failure" 
          value={kpis.failure_count || 0} 
          color="#ef4444"
          change={momChange?.failure_count}
          changeType="percent"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Resume Success" 
          value={kpis.resume_success_rate || 0} 
          suffix="%"
          color="#10b981"
          change={momChange?.resume_success_rate}
          changeType="points"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Failure Rate" 
          value={kpis.failure_rate || 0} 
          suffix="%"
          color="#ef4444"
          change={momChange?.failure_rate}
          changeType="points"
          invertColor
        />
      </Grid>
    </Grid>
  )
}
