import { Box, Card, CardContent, CircularProgress, Grid, Typography, useTheme } from '@mui/material'

import { BarChart, LineChart } from '@/features/dashboard/charts'

interface ChartData {
  by_customer?: Array<{ name: string; count?: number; value?: number; percent?: number }>
  by_category?: Array<{ name: string; count?: number; value?: number; percent?: number }>
  trend?: Array<Record<string, unknown>>
}

interface ChartsSectionProps {
  charts: ChartData
  isMobile?: boolean
  isFetching?: boolean
  crossFilter?: { type: string; value: string } | null
  onCrossFilter: (type: string, value: string) => void
  onShowData: (dimension: string) => (value: string) => void
}

/**
 * Charts section for dashboard
 */
export function ChartsSection({
  charts,
  isMobile = false,
  isFetching = false,
  crossFilter,
  onCrossFilter,
  onShowData,
}: ChartsSectionProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Loading overlay */}
      {isFetching && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: isDark ? 'rgba(9,9,11,0.7)' : 'rgba(255,255,255,0.7)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      {/* Bar Charts */}
      <Grid container spacing={isMobile ? 2 : 3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="By Customer" hint="Right-click on bar to show details">
            <BarChart
              data={charts.by_customer?.slice(0, isMobile ? 5 : 10) || []}
              color="#3b82f6"
              height={isMobile ? 220 : 280}
              onClick={(name) => onCrossFilter('customer', name)}
              onShowData={onShowData('customer')}
              selected={crossFilter?.type === 'customer' ? crossFilter.value : undefined}
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="By Category" hint="Right-click on bar to show details">
            <BarChart
              data={charts.by_category?.slice(0, isMobile ? 5 : 8) || []}
              color="#10b981"
              height={isMobile ? 220 : 280}
              onClick={(name) => onCrossFilter('category', name)}
              onShowData={onShowData('category')}
              selected={crossFilter?.type === 'category' ? crossFilter.value : undefined}
            />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Trend Chart */}
      {charts.trend && charts.trend.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Status Trend
            </Typography>
            <LineChart
              data={charts.trend as Record<string, unknown>[]}
              xKey="date"
              series={[
                { key: 'LOCK', name: 'Lock', color: '#8b5cf6' },
                { key: 'HOLD', name: 'Hold', color: '#f59e0b' },
                { key: 'FAILURE', name: 'Failure', color: '#ef4444' },
              ]}
              height={isMobile ? 220 : 280}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

// Sub-component for chart cards
function ChartCard({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {hint}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

