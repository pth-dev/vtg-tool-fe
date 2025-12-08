import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, CircularProgress } from '@mui/material'
import { BarChart, ShowChart, PieChart, DonutLarge, AreaChart, TableChart, Speed, TextFields } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'

const chartIcons: Record<string, React.ReactNode> = {
  bar: <BarChart />, line: <ShowChart />, pie: <PieChart />, donut: <DonutLarge />,
  area: <AreaChart />, table: <TableChart />, kpi: <Speed />
}

interface Props {
  onAddChart: (chartId: number, chartName: string, chartType: string) => void
  onAddText: () => void
}

export default function WidgetSidebar({ onAddChart, onAddText }: Props) {
  const { data: charts, isLoading } = useQuery({ queryKey: ['charts'], queryFn: api.getCharts })

  return (
    <Box sx={{ width: 240, borderRight: '1px solid #e0e0e0', bgcolor: '#fff', overflow: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>Widgets</Typography>
      </Box>
      <Divider />
      
      <ListItemButton onClick={onAddText}>
        <ListItemIcon><TextFields /></ListItemIcon>
        <ListItemText primary="Text" />
      </ListItemButton>
      
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">Charts</Typography>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
      ) : (
        <List dense>
          {charts?.map(chart => (
            <ListItemButton key={chart.id} onClick={() => onAddChart(chart.id, chart.name, chart.chart_type)}>
              <ListItemIcon sx={{ minWidth: 36 }}>{chartIcons[chart.chart_type] || <BarChart />}</ListItemIcon>
              <ListItemText primary={chart.name} primaryTypographyProps={{ noWrap: true, fontSize: 13 }} />
            </ListItemButton>
          ))}
          {!charts?.length && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>No charts available</Typography>
          )}
        </List>
      )}
    </Box>
  )
}
