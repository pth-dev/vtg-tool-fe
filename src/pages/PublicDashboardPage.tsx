import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, CircularProgress, TextField, Button, Paper, Alert } from '@mui/material'
import { Lock } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { DashboardCanvas, Widget } from '../components/dashboard-designer'
import { ChartPreview } from '../components/chart-builder'
import { api } from '../services/api'

export default function PublicDashboardPage() {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [submittedPassword, setSubmittedPassword] = useState<string>()

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['public-dashboard', token, submittedPassword],
    queryFn: () => api.getPublicDashboard(token!, submittedPassword),
    enabled: !!token,
    retry: false
  })

  const { data: chartDataMap } = useQuery({
    queryKey: ['public-chartData', dashboard?.widgets?.filter(w => w.chartId).map(w => w.chartId)],
    queryFn: async () => {
      const chartIds = [...new Set(dashboard!.widgets.filter(w => w.chartId).map(w => w.chartId!))]
      const results: Record<number, any> = {}
      await Promise.all(chartIds.map(async cid => {
        try { results[cid] = await api.getChartData(cid) } catch {}
      }))
      return results
    },
    enabled: !!dashboard?.widgets?.some(w => w.chartId)
  })

  const widgets: Widget[] = dashboard?.widgets?.map((w: any) => ({
    id: w.id, type: w.type, chartId: w.chartId, chartName: w.chartName,
    content: w.content, x: w.x || 0, y: w.y || 0, w: w.w || 4, h: w.h || 4
  })) || []

  const renderChart = (chartId: number) => {
    const chartData = chartDataMap?.[chartId]
    if (!chartData) return <CircularProgress size={24} />
    return <ChartPreview type={chartData.chart_type} data={chartData.data} title="" />
  }

  // Password required
  if (error?.message?.includes('401') || error?.message?.includes('Password')) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Lock sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">Password Protected</Typography>
            <Typography variant="body2" color="text.secondary">Enter password to view this dashboard</Typography>
          </Box>
          <TextField
            fullWidth type="password" label="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }}
            onKeyDown={(e) => e.key === 'Enter' && setSubmittedPassword(password)}
          />
          <Button fullWidth variant="contained" onClick={() => setSubmittedPassword(password)}>View Dashboard</Button>
        </Paper>
      </Box>
    )
  }

  // Expired or not found
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">Dashboard not found or link has expired</Alert>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', p: 2 }}>
        <Typography variant="h5" fontWeight={600}>{dashboard?.name}</Typography>
      </Box>
      <DashboardCanvas
        widgets={widgets}
        onLayoutChange={() => {}}
        onRemoveWidget={() => {}}
        onSelectWidget={() => {}}
        selectedWidgetId={null}
        isPreview={true}
        renderChart={renderChart}
      />
    </Box>
  )
}
