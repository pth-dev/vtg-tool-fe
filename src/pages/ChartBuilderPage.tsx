import { useState, useEffect } from 'react'
import {
  Box, Grid, Paper, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/ui'
import {
  FieldList, DropZone, ChartPreview, ChartTypeSelector, StylingPanel,
  AggregationSelect, getColorPalette
} from '../components/chart-builder'
import type { ChartType, ChartStyling, AggregationType } from '../components/chart-builder'
import { api, ColumnSchema } from '../services/api'

export default function ChartBuilderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // State
  const [selectedDataset, setSelectedDataset] = useState<number | null>(
    searchParams.get('dataset') ? Number(searchParams.get('dataset')) : null
  )
  const [chartType, setChartType] = useState<ChartType | 'table' | 'kpi'>('bar')
  const [xAxis, setXAxis] = useState<ColumnSchema | null>(null)
  const [yAxis, setYAxis] = useState<ColumnSchema | null>(null)
  const [groupBy, setGroupBy] = useState<ColumnSchema | null>(null)
  const [aggregation, setAggregation] = useState<AggregationType>('sum')
  const [chartName, setChartName] = useState('')
  const [styling, setStyling] = useState<ChartStyling>({
    title: '',
    showLegend: true,
    legendPosition: 'top',
    showDataLabels: false,
    colorPalette: 'vtg'
  })
  const [previewData, setPreviewData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Queries
  const { data: datasetsData } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => api.getDatasets(1, 100)
  })

  const { data: datasetDetail } = useQuery({
    queryKey: ['dataset', selectedDataset],
    queryFn: () => api.getDataset(selectedDataset!),
    enabled: !!selectedDataset
  })

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (params: { dataset_id: number; x_col: string; y_col?: string; agg: string; group_by?: string }) =>
      api.previewChart(params),
    onSuccess: (data) => setPreviewData(data.data),
    onError: (err: any) => setError(err.message)
  })

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: { dataset_id: number; name: string; chart_type: string; config: any }) =>
      api.createChart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] })
      navigate('/admin/charts')
    },
    onError: (err: any) => setError(err.message)
  })

  // Auto-preview when config changes
  useEffect(() => {
    if (selectedDataset && xAxis) {
      previewMutation.mutate({
        dataset_id: selectedDataset,
        x_col: xAxis.name,
        y_col: yAxis?.name,
        agg: aggregation,
        group_by: groupBy?.name
      })
    }
  }, [selectedDataset, xAxis, yAxis, aggregation, groupBy])

  const handleSave = () => {
    if (!selectedDataset || !xAxis || !chartName.trim()) {
      setError('Please fill in all required fields')
      return
    }

    saveMutation.mutate({
      dataset_id: selectedDataset,
      name: chartName.trim(),
      chart_type: chartType,
      config: {
        x_col: xAxis.name,
        y_col: yAxis?.name,
        agg: aggregation,
        group_by: groupBy?.name,
        styling
      }
    })
  }

  const columns = datasetDetail?.columns || []

  return (
    <Box p={3}>
      <PageHeader
        title="Chart Builder"
        action={
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!selectedDataset || !xAxis || !chartName.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Chart'}
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2}>
        {/* Left Panel - Fields */}
        <Grid size={{ xs: 12, md: 2.5 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Dataset</InputLabel>
              <Select
                value={selectedDataset || ''}
                onChange={(e) => {
                  setSelectedDataset(Number(e.target.value))
                  setXAxis(null)
                  setYAxis(null)
                  setGroupBy(null)
                  setPreviewData([])
                }}
                label="Dataset"
              >
                {datasetsData?.items.map((ds) => (
                  <MenuItem key={ds.id} value={ds.id}>{ds.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {columns.length > 0 && (
            <FieldList columns={columns} onDragStart={() => {}} />
          )}
        </Grid>

        {/* Center - Chart Config & Preview */}
        <Grid size={{ xs: 12, md: 6.5 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Chart Type</Typography>
            <ChartTypeSelector value={chartType} onChange={setChartType} />
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <DropZone
                  label="X-Axis (Category)"
                  accepts={['string', 'date']}
                  value={xAxis}
                  onChange={setXAxis}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DropZone
                  label="Y-Axis (Value)"
                  accepts={['number']}
                  value={yAxis}
                  onChange={setYAxis}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DropZone
                  label="Group By (Optional)"
                  accepts={['string', 'date']}
                  value={groupBy}
                  onChange={setGroupBy}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <AggregationSelect value={aggregation} onChange={setAggregation} />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ height: 350 }}>
            <ChartPreview
              type={chartType === 'table' || chartType === 'kpi' ? 'bar' : chartType}
              data={previewData}
              title={styling.title}
              colors={getColorPalette(styling.colorPalette)}
            />
          </Box>
        </Grid>

        {/* Right Panel - Styling */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Chart Name</Typography>
            <TextField
              fullWidth
              size="small"
              value={chartName}
              onChange={(e) => setChartName(e.target.value)}
              placeholder="Enter chart name"
            />
          </Paper>

          <StylingPanel value={styling} onChange={setStyling} />
        </Grid>
      </Grid>
    </Box>
  )
}
