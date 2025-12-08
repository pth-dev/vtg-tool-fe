import { Box, Card, CardContent, Typography, Grid, Chip, Table, TableHead, TableRow, TableCell, TableBody, useMediaQuery, useTheme, CircularProgress } from '@mui/material'
import { PageHeader, KpiCard, FilterPanel, DashboardSkeleton } from '../components/ui'
import { BarChart, LineChart } from '../components/charts'
import { useDashboard } from '../hooks'

export default function DashboardPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data, isLoading, isFetching, filters, filterOptions, selectedMonth, crossFilter, toggleCrossFilter, updateFilter, clearFilters } = useDashboard()

  // First load - show full skeleton
  if (isLoading && !data) return <DashboardSkeleton />
  
  // No data
  if (!data?.kpis?.total_orders) return <Box p={3}><Typography color="text.secondary">No data available. Admin needs to upload file first.</Typography></Box>

  const { kpis, charts } = data

  return (
    <Box p={isMobile ? 2 : 3}>
      <PageHeader 
        title="Lock/Hold/Failed Dashboard" 
        subtitle={`Data: ${selectedMonth || ''}`}
        action={!isMobile && data.source_name && <Chip label={data.source_name} color="primary" variant="outlined" size="small" />}
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
      </Box>

      {/* Charts - with loading overlay */}
      <Box sx={{ position: 'relative' }}>
        {isFetching && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(9,9,11,0.7)' : 'rgba(255,255,255,0.7)', 
            zIndex: 10, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CircularProgress size={32} />
          </Box>
        )}
        
        <Grid container spacing={isMobile ? 2 : 3} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>By Customer</Typography>
                <BarChart 
                  data={charts.by_customer?.slice(0, isMobile ? 5 : 10) || []} 
                  color="#3b82f6"
                  height={isMobile ? 220 : 280}
                  onClick={(name) => toggleCrossFilter('customer', name)}
                  selected={crossFilter?.type === 'customer' ? crossFilter.value : undefined}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>By Category</Typography>
                <BarChart 
                  data={charts.by_category?.slice(0, isMobile ? 5 : 8) || []} 
                  color="#10b981"
                  height={isMobile ? 220 : 280}
                  onClick={(name) => toggleCrossFilter('category', name)}
                  selected={crossFilter?.type === 'category' ? crossFilter.value : undefined}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Trend Chart */}
        {charts?.trend && charts.trend.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>Status Trend</Typography>
              <LineChart 
                data={charts.trend} 
                xKey="date"
                series={[
                  { key: 'LOCK', name: 'Lock', color: '#8b5cf6' },
                  { key: 'HOLD', name: 'Hold', color: '#f59e0b' },
                  { key: 'FAILURE', name: 'Failure', color: '#ef4444' }
                ]}
                height={isMobile ? 220 : 280}
              />
            </CardContent>
          </Card>
        )}

        {/* Root Causes Table */}
        {data.root_causes && data.root_causes.length > 0 && (
          <Card>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>Root Causes & Improvement Plans</Typography>
              <Box sx={{ maxHeight: isMobile ? 300 : 350, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, minWidth: isMobile ? 150 : 200 }}>Root Cause</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Count</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>%</TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Improvement Plan</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.root_causes.slice(0, isMobile ? 10 : 20).map((rc: { root_cause: string; count: number; percent: number; improvement_plan?: string }, i: number) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontSize: 13 }}>{rc.root_cause}</TableCell>
                        <TableCell align="right">{rc.count}</TableCell>
                        <TableCell align="right">{rc.percent}%</TableCell>
                        {!isMobile && <TableCell sx={{ fontSize: 13 }}>{rc.improvement_plan}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}
