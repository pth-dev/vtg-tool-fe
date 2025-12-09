import {
  AreaChart,
  BarChart,
  DonutLarge,
  PieChart,
  ShowChart,
  Speed,
  TableChart,
} from '@mui/icons-material'
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'

import { ChartType } from './ChartPreview'

interface Props {
  value: ChartType | 'table' | 'kpi'
  onChange: (type: ChartType | 'table' | 'kpi') => void
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: <BarChart /> },
  { value: 'line', label: 'Line Chart', icon: <ShowChart /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieChart /> },
  { value: 'donut', label: 'Donut Chart', icon: <DonutLarge /> },
  { value: 'area', label: 'Area Chart', icon: <AreaChart /> },
  { value: 'table', label: 'Table', icon: <TableChart /> },
  { value: 'kpi', label: 'KPI Card', icon: <Speed /> },
] as const

export function ChartTypeSelector({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      size="small"
      sx={{ flexWrap: 'wrap' }}
    >
      {CHART_TYPES.map(({ value: v, label, icon }) => (
        <Tooltip key={v} title={label}>
          <ToggleButton value={v} sx={{ px: 2 }}>
            {icon}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  )
}
