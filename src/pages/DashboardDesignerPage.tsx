import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, IconButton, Button, TextField, CircularProgress } from '@mui/material'
import { ArrowBack, Undo, Redo, Visibility, Edit, Save, Share } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardCanvas, WidgetSidebar, PropertiesPanel, GlobalFilters, ShareDialog, Widget } from '../components/dashboard-designer'
import { ChartPreview } from '../components/chart-builder'
import { api } from '../services/api'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { useAutoSave } from '../hooks/useAutoSave'

export default function DashboardDesignerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [filters, setFilters] = useState<any>({})
  const [shareOpen, setShareOpen] = useState(false)

  const { state: widgets, set: setWidgets, undo, redo, canUndo, canRedo } = useUndoRedo<Widget[]>([])

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => api.getDashboard(Number(id)),
    enabled: !!id
  })

  const { data: chartDataMap } = useQuery({
    queryKey: ['chartData', widgets.filter(w => w.chartId).map(w => w.chartId)],
    queryFn: async () => {
      const chartIds = [...new Set(widgets.filter(w => w.chartId).map(w => w.chartId!))]
      const results: Record<number, any> = {}
      await Promise.all(chartIds.map(async cid => {
        try { results[cid] = await api.getChartData(cid) } catch {}
      }))
      return results
    },
    enabled: widgets.some(w => w.chartId)
  })

  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name)
      setWidgets(dashboard.widgets.map((w: any) => ({ ...w, id: w.id || `w-${Date.now()}-${Math.random()}` })))
    }
  }, [dashboard])

  const saveMutation = useMutation({
    mutationFn: (data: { name: string; widgets: Widget[] }) => api.updateDashboard(Number(id), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] })
  })

  const { isSaving, lastSaved } = useAutoSave({ name, widgets }, (data) => saveMutation.mutateAsync(data).then(() => {}), 5000)

  const addChart = useCallback((chartId: number, chartName: string) => {
    const newWidget: Widget = {
      id: `w-${Date.now()}`, type: 'chart', chartId, chartName,
      x: 0, y: Infinity, w: 4, h: 4
    }
    setWidgets(prev => [...prev, newWidget])
  }, [setWidgets])

  const addText = useCallback(() => {
    const newWidget: Widget = {
      id: `w-${Date.now()}`, type: 'text', content: 'New text',
      x: 0, y: Infinity, w: 3, h: 2
    }
    setWidgets(prev => [...prev, newWidget])
  }, [setWidgets])

  const removeWidget = useCallback((wid: string) => {
    setWidgets(prev => prev.filter(w => w.id !== wid))
    if (selectedWidgetId === wid) setSelectedWidgetId(null)
  }, [setWidgets, selectedWidgetId])

  const updateWidget = useCallback((wid: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === wid ? { ...w, ...updates } : w))
  }, [setWidgets])

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null

  const renderChart = useCallback((chartId: number) => {
    const chartData = chartDataMap?.[chartId]
    if (!chartData) return <CircularProgress size={24} />
    return <ChartPreview type={chartData.chart_type} data={chartData.data} title="" />
  }, [chartDataMap])

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton edge="start" onClick={() => navigate('/dashboard-list')}><ArrowBack /></IconButton>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="standard"
            sx={{ mx: 2, width: 200 }}
            placeholder="Dashboard name"
          />
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={undo} disabled={!canUndo}><Undo /></IconButton>
          <IconButton onClick={redo} disabled={!canRedo}><Redo /></IconButton>
          <IconButton onClick={() => setIsPreview(!isPreview)} color={isPreview ? 'primary' : 'default'}>
            {isPreview ? <Edit /> : <Visibility />}
          </IconButton>
          <IconButton onClick={() => setShareOpen(true)}><Share /></IconButton>
          <Button startIcon={<Save />} onClick={() => saveMutation.mutate({ name, widgets })} disabled={saveMutation.isPending}>
            Save
          </Button>
          {isSaving && <Typography variant="caption" sx={{ ml: 1 }}>Saving...</Typography>}
          {lastSaved && !isSaving && <Typography variant="caption" sx={{ ml: 1 }}>Saved {lastSaved.toLocaleTimeString()}</Typography>}
        </Toolbar>
      </AppBar>

      <GlobalFilters filters={filters} onChange={setFilters} isPreview={isPreview} />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isPreview && <WidgetSidebar onAddChart={addChart} onAddText={addText} />}
        <DashboardCanvas
          widgets={widgets}
          onLayoutChange={setWidgets}
          onRemoveWidget={removeWidget}
          onSelectWidget={setSelectedWidgetId}
          selectedWidgetId={selectedWidgetId}
          isPreview={isPreview}
          renderChart={renderChart}
        />
        {!isPreview && <PropertiesPanel widget={selectedWidget} onUpdate={updateWidget} />}
      </Box>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        dashboardId={Number(id)}
        dashboardName={name}
        isPublic={dashboard?.is_public || false}
        publicToken={dashboard?.public_token}
      />
    </Box>
  )
}
