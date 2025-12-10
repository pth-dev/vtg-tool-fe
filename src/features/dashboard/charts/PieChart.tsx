import { Box, useTheme } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'

import { useChartTheme } from '@/features/dashboard/hooks/useChartTheme'

interface DataItem {
  name: string
  count?: number
  value?: number
  percent?: number
}

interface Props {
  data: DataItem[]
  height?: number
  onClick?: (name: string) => void
  selected?: string
}

export default function PieChart({ data, height = 300, onClick }: Props) {
  const theme = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme.palette.mode === 'dark'

  const values = data.map((d) => d.count ?? d.value ?? 0)
  const labels = data.map((d) => d.name)
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

  const options: ApexOptions = {
    ...chartTheme,
    labels,
    colors,
    legend: {
      ...chartTheme.legend,
      position: 'right',
      fontSize: '11px',
      itemMargin: { horizontal: 4, vertical: 2 },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: { fontSize: '10px', fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    stroke: { width: 1, colors: [isDark ? '#18181b' : '#fff'] },
    plotOptions: {
      pie: {
        expandOnClick: true,
        offsetY: 0,
        customScale: 1,
        dataLabels: { offset: -5 },
      },
    },
    chart: {
      ...chartTheme.chart,
      offsetY: -10,
      events: onClick
        ? {
            dataPointSelection: (_, __, config) => {
              onClick(data[config.dataPointIndex].name)
            },
          }
        : undefined,
    },
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Chart type="pie" options={options} series={values} height={height} width="100%" />
    </Box>
  )
}
