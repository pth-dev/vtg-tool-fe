import { Grid } from '@mui/material'
import { KpiCard } from '@/shared/components/ui'

interface AggregatedData {
  total_orders: number
  overall_failure_rate: number
  avg_monthly_rate: number
  trend_change: number
  trend_direction: 'improving' | 'worsening' | 'stable'
  best_month: { label: string; failure_rate: number }
  worst_month: { label: string; failure_rate: number }
}

interface CompareKpiSectionProps {
  data: AggregatedData | null
  isMobile?: boolean
}

export function CompareKpiSection({ data, isMobile = false }: CompareKpiSectionProps) {
  if (!data) return null

  const trendIcon = data.trend_direction === 'improving' ? '↓' : data.trend_direction === 'worsening' ? '↑' : '→'
  const trendColor = data.trend_direction === 'improving' ? '#10b981' : data.trend_direction === 'worsening' ? '#ef4444' : '#6b7280'
  const trendLabel = data.trend_direction === 'improving' ? 'Improving' : data.trend_direction === 'worsening' ? 'Worsening' : 'Stable'

  return (
    <Grid container spacing={isMobile ? 1.5 : 2} mb={3}>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Total Orders" 
          value={data.total_orders.toLocaleString()} 
          color="#3b82f6"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Overall Failure Rate" 
          value={data.overall_failure_rate}
          suffix="%"
          color={data.overall_failure_rate > 15 ? '#ef4444' : data.overall_failure_rate > 10 ? '#f59e0b' : '#10b981'}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Avg Monthly Rate" 
          value={data.avg_monthly_rate}
          suffix="%"
          color={data.avg_monthly_rate > 15 ? '#ef4444' : data.avg_monthly_rate > 10 ? '#f59e0b' : '#10b981'}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Trend" 
          value={`${trendIcon} ${Math.abs(data.trend_change)}`}
          suffix="pt"
          subtitle={trendLabel}
          color={trendColor}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Best Month" 
          value={data.best_month.label}
          subtitle={`${data.best_month.failure_rate}%`}
          color="#10b981"
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <KpiCard 
          title="Worst Month" 
          value={data.worst_month.label}
          subtitle={`${data.worst_month.failure_rate}%`}
          color="#ef4444"
        />
      </Grid>
    </Grid>
  )
}
