import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  Add,
  AreaChart,
  BarChart,
  Delete,
  DonutLarge,
  Edit,
  PieChart,
  ShowChart,
  Visibility,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { ChartPreview, getColorPalette } from '@/features/chart-builder/components'
import { PageHeader } from '@/shared/components/ui'
import { api } from '@/services/api'
import { useConfirm } from '@/shared/stores'

const CHART_ICONS: Record<string, React.ReactNode> = {
  bar: <BarChart />,
  line: <ShowChart />,
  pie: <PieChart />,
  donut: <DonutLarge />,
  area: <AreaChart />,
}

export default function ChartListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [previewChart, setPreviewChart] = useState<{ id: number; name: string } | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)

  const { data: charts, isLoading } = useQuery({
    queryKey: ['charts'],
    queryFn: api.getCharts,
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteChart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['charts'] }),
  })

  const handlePreview = async (chart: { id: number; name: string }) => {
    setPreviewChart(chart)
    const data = await api.getChartData(chart.id)
    setPreviewData(data)
  }

  const handleDelete = (chart: { id: number; name: string }) => {
    confirm({
      title: 'Delete Chart',
      message: `Are you sure you want to delete "${chart.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'error',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(chart.id)
      },
    })
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Charts"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate({ to: '/admin/chart-builder' })}
          >
            New Chart
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : charts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No charts yet
                </TableCell>
              </TableRow>
            ) : (
              charts?.map((chart) => (
                <TableRow key={chart.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {CHART_ICONS[chart.chart_type] || <BarChart />}
                      <Typography variant="body2">{chart.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={chart.chart_type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatDate(chart.created_at)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handlePreview(chart)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate({ to: `/admin/chart-builder?edit=${chart.id}` })}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(chart)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewChart}
        onClose={() => {
          setPreviewChart(null)
          setPreviewData(null)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewChart?.name}</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box sx={{ height: 400 }}>
              <ChartPreview
                type={previewData.chart_type}
                data={previewData.data}
                title={previewData.config?.styling?.title}
                colors={getColorPalette(previewData.config?.styling?.colorPalette || 'vtg')}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPreviewChart(null)
              setPreviewData(null)
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
