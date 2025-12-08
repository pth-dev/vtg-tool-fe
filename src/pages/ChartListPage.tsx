import { useState } from 'react'
import {
  Box, Card, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material'
import { Add, Edit, Delete, Visibility, BarChart, ShowChart, PieChart, DonutLarge, AreaChart } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui'
import { ChartPreview, getColorPalette } from '../components/chart-builder'
import { api } from '../services/api'

const CHART_ICONS: Record<string, React.ReactNode> = {
  bar: <BarChart />,
  line: <ShowChart />,
  pie: <PieChart />,
  donut: <DonutLarge />,
  area: <AreaChart />
}

export default function ChartListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [previewChart, setPreviewChart] = useState<{ id: number; name: string } | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)

  const { data: charts, isLoading } = useQuery({
    queryKey: ['charts'],
    queryFn: api.getCharts
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteChart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['charts'] })
  })

  const handlePreview = async (chart: { id: number; name: string }) => {
    setPreviewChart(chart)
    const data = await api.getChartData(chart.id)
    setPreviewData(data)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Charts"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/chart-builder')}>
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
              <TableRow><TableCell colSpan={4} align="center">Loading...</TableCell></TableRow>
            ) : charts?.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No charts yet</TableCell></TableRow>
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
                    <IconButton size="small" onClick={() => navigate(`/admin/chart-builder?edit=${chart.id}`)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(chart.id)}>
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
      <Dialog open={!!previewChart} onClose={() => { setPreviewChart(null); setPreviewData(null) }} maxWidth="md" fullWidth>
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
          <Button onClick={() => { setPreviewChart(null); setPreviewData(null) }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
