import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Box, Card, CardContent, Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'

import { DashboardSkeleton, FilterPanel, PageHeader } from '@/shared/components/ui'
import { useDashboard } from '@/hooks'
import { FailureRateTrend, HorizontalStackedBar, MonthlyVolumeChart, RootCauseAnalysis, type TreemapItem } from '@/features/dashboard/charts'

import { AlertBanner } from './AlertBanner'
import { CompareKpiSection } from './CompareKpiSection'
import { DrilldownDialog } from './DrilldownDialog'
import { EditableChartsGrid } from './EditableChartsGrid'
import { ExportButton } from './ExportButton'
import { KpiSection } from './KpiSection'
import { ModeToggle, type DashboardMode } from './ModeToggle'

interface DrilldownData {
  data: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
  columns: string[]
}

interface MonthlyData {
  month: string
  label: string
  total: number
  lock: number
  hold: number
  failure: number
  failure_rate: number
}

interface TrendData {
  name: string
  data: { month: string; count: number }[]
}

interface ComparisonData {
  monthly_data: MonthlyData[]
  aggregated: {
    total_orders: number
    overall_failure_rate: number
    avg_monthly_rate: number
    trend_change: number
    trend_direction: 'improving' | 'worsening' | 'stable'
    best_month: { label: string; failure_rate: number }
    worst_month: { label: string; failure_rate: number }
  } | null
  customer_trend: TrendData[]
  category_trend: TrendData[]
}

export default function DashboardPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mode, setMode] = useState<DashboardMode>('single')
  
  const {
    data,
    isLoading,
    isFetching,
    filters,
    filterOptions,
    selectedMonth,
    momChange,
    crossFilter,
    toggleCrossFilter,
    updateFilter,
    clearFilters,
  } = useDashboard()

  // Decomposition Tree data (Single mode)
  const { data: decompositionData } = useQuery<{ data: TreemapItem | null }>({
    queryKey: ['dashboard-decomposition', selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedMonth) params.set('month', selectedMonth)
      const res = await fetch(`/api/dashboard/decomposition?${params}`)
      return res.json()
    },
    enabled: !!data?.kpis?.total_orders && mode === 'single',
  })

  // Comparison data (Compare mode)
  const { data: comparisonData } = useQuery<ComparisonData>({
    queryKey: ['dashboard-comparison'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/comparison?months=6')
      return res.json()
    },
    enabled: mode === 'compare',
  })

  // Drilldown state
  const [drilldown, setDrilldown] = useState<{ dimension: string; value: string } | null>(null)
  const [drilldownPage, setDrilldownPage] = useState(0)
  const [drilldownRowsPerPage, setDrilldownRowsPerPage] = useState(20)

  const { data: drilldownData, isLoading: isDrilldownLoading } = useQuery<DrilldownData>({
    queryKey: [
      'dashboard-drilldown',
      drilldown?.dimension,
      drilldown?.value,
      selectedMonth,
      drilldownPage,
      drilldownRowsPerPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        dimension: drilldown!.dimension,
        value: drilldown!.value,
        page: String(drilldownPage + 1),
        page_size: String(drilldownRowsPerPage),
      })
      if (selectedMonth) params.set('month', selectedMonth)
      const res = await fetch(`/api/dashboard/drilldown?${params}`)
      return res.json()
    },
    enabled: !!drilldown,
  })

  const handleShowData = (dimension: string) => (value: string) => {
    setDrilldown({ dimension, value })
    setDrilldownPage(0)
  }

  const handleCloseDrilldown = () => {
    setDrilldown(null)
    setDrilldownPage(0)
  }

  if (isLoading && !data) return <DashboardSkeleton />

  if (!data?.kpis?.total_orders) {
    return (
      <Box p={3}>
        <Typography color="text.secondary">
          No data available. Admin needs to upload file first.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: isMobile ? 1.5 : 3,
          py: isMobile ? 1 : 2,
          zIndex: 10,
        }}
      >
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          spacing={1}
        >
          <PageHeader
            title={isMobile ? 'Dashboard' : 'Lock/Hold/Failed Dashboard'}
            subtitle={!isMobile && mode === 'single' 
              ? (data.source_name ? `Source: ${data.source_name}` : undefined)
              : (!isMobile ? 'Last 6 Months Comparison' : undefined)
            }
            compact={isMobile}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <ModeToggle value={mode} onChange={setMode} compact={isMobile} />
            {mode === 'single' && !isMobile && (
              <ExportButton data={{ kpis: data.kpis, charts: data.charts, selectedMonth }} />
            )}
          </Stack>
        </Stack>

        {/* Filter Panel - Single Mode Only */}
        {mode === 'single' && filterOptions && (
          <Box sx={{ mt: isMobile ? 1 : 2 }}>
            <FilterPanel
              filters={filters}
              options={filterOptions}
              selectedMonth={selectedMonth || ''}
              onChange={updateFilter}
              onClear={clearFilters}
            />
          </Box>
        )}
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: isMobile ? 1.5 : 3,
          py: isMobile ? 1 : 2,
        }}
      >
        {/* Alert Banner */}
        {mode === 'single' && data.kpis.failure_rate && (
          <AlertBanner failureRate={data.kpis.failure_rate} threshold={20} />
        )}

        {/* ========== SINGLE MODE ========== */}
        {mode === 'single' && (
          <>
            <Box sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <KpiSection kpis={data.kpis} momChange={momChange} isMobile={isMobile} />
            </Box>

            <EditableChartsGrid
              charts={data.charts}
              crossFilter={crossFilter}
              onCrossFilter={toggleCrossFilter}
              onShowData={handleShowData}
            />

            <RootCauseAnalysis
              rootCauses={data.root_causes || []}
              treemapData={decompositionData?.data || null}
            isMobile={isMobile}
          />
        </>
      )}

      {/* ========== COMPARE MODE ========== */}
      {mode === 'compare' && comparisonData && (
        <>
          <CompareKpiSection data={comparisonData.aggregated} isMobile={isMobile} />

          {/* Row 1: Failure Rate Trend + Monthly Volume */}
          <Grid container spacing={isMobile ? 2 : 3} mb={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Failure Rate Trend
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Cancelled / Total Orders × 100%
                  </Typography>
                  <FailureRateTrend 
                    data={comparisonData.monthly_data.map(d => ({
                      month: d.month,
                      label: d.label,
                      failure_rate: d.failure_rate,
                      total: d.total,
                      canceled: 0,
                    }))} 
                    height={isMobile ? 220 : 280} 
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Monthly Volume by Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Lock / Hold / Failure per month
                  </Typography>
                  <MonthlyVolumeChart 
                    data={comparisonData.monthly_data} 
                    height={isMobile ? 220 : 280} 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 2: Customer Trend + Category Trend */}
          <Grid container spacing={isMobile ? 2 : 3} mb={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Top Customers by Failures
                  </Typography>
                  <HorizontalStackedBar 
                    data={comparisonData.customer_trend || []} 
                    height={isMobile ? 220 : 280}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Top Categories by Failures
                  </Typography>
                  <HorizontalStackedBar 
                    data={comparisonData.category_trend || []} 
                    height={isMobile ? 220 : 280}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Drilldown Dialog */}
      {drilldown && (
        <DrilldownDialog
          open={!!drilldown}
          dimension={drilldown.dimension}
          value={drilldown.value}
          data={drilldownData?.data || []}
          columns={drilldownData?.columns || []}
          total={drilldownData?.total || 0}
          page={drilldownPage}
          rowsPerPage={drilldownRowsPerPage}
          isLoading={isDrilldownLoading}
          onClose={handleCloseDrilldown}
          onPageChange={setDrilldownPage}
          onRowsPerPageChange={(rows) => {
            setDrilldownRowsPerPage(rows)
            setDrilldownPage(0)
          }}
        />
      )}
      </Box>
    </Box>
  )
}
