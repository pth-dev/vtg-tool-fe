import { useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Chip, CircularProgress, OutlinedInput, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material'
import { PageHeader, KpiCard } from '../components/ui'
import { DonutChart, BarChart, AreaChart } from '../components/charts'
import { useDashboard } from '../hooks'

export default function DashboardPage() {
  const { data, isLoading, charts, customers, statusFilter, setStatusFilter, customerFilter, setCustomerFilter } = useDashboard()
  const [tab, setTab] = useState(0)

  const handleCustomerChange = (e: SelectChangeEvent<string[]>) => {
    setCustomerFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
  }

  if (isLoading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
  if (!data?.kpis?.total_orders) return <Box p={4}><Typography color="text.secondary">No data available. Admin needs to upload file first.</Typography></Box>

  const { kpis } = data

  return (
    <Box p={3}>
      <PageHeader 
        title="Lock/Hold/Failed Dashboard" 
        subtitle="Order data analysis"
        action={data.source_name && <Chip label={data.source_name} color="primary" variant="outlined" />}
      />

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Total Orders" value={kpis.total_orders} color="#3b82f6" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard title="HOLD" value={kpis.hold_count} color="#f59e0b" percent={kpis.hold_count / kpis.total_orders * 100} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard title="FAILURE" value={kpis.failure_count} color="#ef4444" percent={kpis.failure_count / kpis.total_orders * 100} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard title="LOCK" value={kpis.lock_count} color="#8b5cf6" percent={kpis.lock_count / kpis.total_orders * 100} /></Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="HOLD">HOLD</MenuItem>
                  <MenuItem value="FAILURE">FAILURE</MenuItem>
                  <MenuItem value="LOCK">LOCK</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Customer</InputLabel>
                <Select multiple value={customerFilter} onChange={handleCustomerChange} input={<OutlinedInput label="Customer" />} renderValue={s => s.join(', ')}>
                  {customers.map(c => (
                    <MenuItem key={c} value={c}><Checkbox checked={customerFilter.includes(c)} /><ListItemText primary={c} /></MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" />
          <Tab label="Trend" />
          <Tab label="Details" />
        </Tabs>
        <CardContent>
          {tab === 0 && charts && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>Distribution by Status</Typography>
                <DonutChart data={charts.by_status} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>Top Customers</Typography>
                <BarChart data={charts.by_customer} />
              </Grid>
            </Grid>
          )}
          {tab === 1 && charts && (
            <>
              <Typography variant="subtitle2" gutterBottom>Daily Trend</Typography>
              <AreaChart data={charts.trend.map(t => ({ label: t.date, value: t.count }))} />
            </>
          )}
          {tab === 2 && charts && (
            <>
              <Typography variant="subtitle2" gutterBottom>Distribution by Category</Typography>
              <BarChart data={charts.by_category} color="#10b981" height={380} />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
