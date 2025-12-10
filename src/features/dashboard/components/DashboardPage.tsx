import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Box, Chip, Typography, useMediaQuery, useTheme } from '@mui/material'

import { DashboardSkeleton, FilterPanel, PageHeader } from '@/shared/components/ui'
import { useDashboard } from '@/hooks'

import { EditableChartsGrid } from './EditableChartsGrid'
import { DrilldownDialog } from './DrilldownDialog'
import { KpiSection } from './KpiSection'
import { RootCausesTable } from './RootCausesTable'

interface DrilldownData {
  data: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
  columns: string[]
}

export default function DashboardPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const {
    data,
    isLoading,
    isFetching,
    filters,
    filterOptions,
    selectedMonth,
    crossFilter,
    toggleCrossFilter,
    updateFilter,
    clearFilters,
  } = useDashboard()

  // Drilldown state
  const [drilldown, setDrilldown] = useState<{ dimension: string; value: string } | null>(null)
  const [drilldownPage, setDrilldownPage] = useState(0)
  const [drilldownRowsPerPage, setDrilldownRowsPerPage] = useState(20)

  // Drilldown query
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

  // First load - show full skeleton
  if (isLoading && !data) return <DashboardSkeleton />

  // No data
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
    <Box p={isMobile ? 2 : 3}>
      <PageHeader
        title="Lock/Hold/Failed Dashboard"
        subtitle={`Data: ${selectedMonth || ''}`}
        action={
          !isMobile && data.source_name ? (
            <Chip label={data.source_name} color="primary" variant="outlined" size="small" />
          ) : undefined
        }
      />

      {/* Filters */}
      {filterOptions && (
        <FilterPanel
          filters={filters}
          options={filterOptions}
          selectedMonth={selectedMonth || ''}
          onChange={updateFilter}
          onClear={clearFilters}
        />
      )}

      {/* KPI Cards */}
      <Box sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <KpiSection kpis={data.kpis} isMobile={isMobile} />
      </Box>

      {/* Charts - Editable Grid */}
      <EditableChartsGrid
        charts={data.charts}
        crossFilter={crossFilter}
        onCrossFilter={toggleCrossFilter}
        onShowData={handleShowData}
      />

      {/* Root Causes Table */}
      <RootCausesTable data={data.root_causes} isMobile={isMobile} />

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
  )
}
