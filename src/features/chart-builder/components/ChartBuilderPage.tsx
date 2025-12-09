import { Refresh, Save } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'

import {
  AggregationSelect,
  ChartPreview,
  ChartTypeSelector,
  DropZone,
  FieldList,
  StylingPanel,
  getColorPalette,
} from '@/features/chart-builder/components'
import { PageHeader } from '@/shared/components/ui'
import { useChartBuilder } from '@/features/chart-builder/hooks'
import { LoadingOverlay } from '@/shared/components/ui'
import { useThemeMode } from '@/shared/hooks'

export default function ChartBuilderPage() {
  const { isDark, sx: themeSx } = useThemeMode()
  const builder = useChartBuilder()

  return (
    <Box p={3}>
      <PageHeader
        title="Chart Builder"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={builder.handleRefreshPreview}
              disabled={!builder.xAxis || builder.isPreviewLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={builder.handleSave}
              disabled={
                !builder.selectedDataset ||
                !builder.xAxis ||
                !builder.chartName.trim() ||
                builder.isSaving
              }
            >
              {builder.isSaving ? 'Saving...' : 'Save Chart'}
            </Button>
          </Box>
        }
      />

      {builder.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => builder.setError(null)}>
          {builder.error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Left Panel - Fields */}
        <Grid size={{ xs: 12, md: 2.5 }}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: isDark ? '#0c0c0c' : 'background.paper' }}>
            <FormControl fullWidth size="small">
              <InputLabel>Dataset</InputLabel>
              <Select
                value={builder.selectedDataset || ''}
                onChange={(e) => builder.handleDatasetChange(Number(e.target.value))}
                label="Dataset"
                sx={{ ...themeSx.inputRoot }}
              >
                {builder.datasets.map((ds) => (
                  <MenuItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {builder.isDatasetLoading ? (
            <Paper sx={{ p: 2 }}>
              <Skeleton height={32} />
              <Skeleton height={32} />
              <Skeleton height={32} />
            </Paper>
          ) : (
            <FieldList
              columns={builder.columns}
              onDragStart={() => {}}
              onFieldClick={builder.handleFieldClick}
            />
          )}
        </Grid>

        {/* Center - Chart Config & Preview */}
        <Grid size={{ xs: 12, md: 6.5 }}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: isDark ? '#0c0c0c' : 'background.paper' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Chart Type
            </Typography>
            <ChartTypeSelector value={builder.chartType} onChange={builder.setChartType} />
          </Paper>

          <Paper sx={{ p: 2, mb: 2, bgcolor: isDark ? '#0c0c0c' : 'background.paper' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <DropZone
                  label="X-Axis (Category)"
                  accepts={['string', 'date']}
                  value={builder.xAxis}
                  onChange={builder.setXAxis}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DropZone
                  label="Y-Axis (Value)"
                  accepts={['number']}
                  value={builder.yAxis}
                  onChange={builder.setYAxis}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DropZone
                  label="Group By (Optional)"
                  accepts={['string', 'date']}
                  value={builder.groupBy}
                  onChange={builder.setGroupBy}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <AggregationSelect value={builder.aggregation} onChange={builder.setAggregation} />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ height: 380, position: 'relative' }}>
            <LoadingOverlay show={builder.isPreviewLoading} text="Loading preview..." />
            <ChartPreview
              type={
                builder.chartType === 'table' || builder.chartType === 'kpi'
                  ? 'bar'
                  : builder.chartType
              }
              data={builder.previewData}
              title={builder.styling.title}
              colors={getColorPalette(builder.styling.colorPalette || 'vtg')}
            />
          </Box>
        </Grid>

        {/* Right Panel - Styling */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: isDark ? '#0c0c0c' : 'background.paper' }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Chart Name *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={builder.chartName}
              onChange={(e) => builder.setChartName(e.target.value)}
              placeholder="Enter chart name"
              sx={{ '& .MuiOutlinedInput-root': themeSx.inputRoot }}
            />
          </Paper>

          <StylingPanel value={builder.styling} onChange={builder.setStyling} />
        </Grid>
      </Grid>
    </Box>
  )
}
