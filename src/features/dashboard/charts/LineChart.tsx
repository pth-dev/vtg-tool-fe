import { useTheme } from '@mui/material'

import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'

import { chartColors, useChartTheme } from '@/features/chart-builder/hooks/useChartTheme'

interface Props {
  data: Record<string, unknown>[]
  xKey: string
  series: { key: string; name: string; color?: string }[]
  height?: number
}

export default function LineChart({ data, xKey, series, height = 320 }: Props) {
  const theme = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme.palette.mode === 'dark'

  // Use provided colors or fall back to theme colors
  const colors = series.map(
    (s, i) =>
      s.color ||
      (isDark
        ? chartColors.dark[i % chartColors.dark.length]
        : chartColors.light[i % chartColors.light.length])
  )

  const options: ApexOptions = {
    ...chartTheme,
    chart: {
      ...chartTheme.chart,
      type: 'line',
    },
    xaxis: {
      ...chartTheme.xaxis,
      categories: data.map((d) => String(d[xKey] ?? '')),
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
          colors: isDark ? '#a1a1aa' : '#71717a',
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors,
    legend: {
      ...chartTheme.legend,
      position: 'top',
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 6,
      },
    },
  }

  const chartSeries = series.map((s) => ({
    name: s.name,
    data: data.map((d) => Number(d[s.key]) || 0),
  }))

  return <Chart type="line" options={options} series={chartSeries} height={height} />
}
