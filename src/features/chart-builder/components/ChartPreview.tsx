import { memo, useMemo } from 'react'

import { Paper, Typography, useTheme } from '@mui/material'

import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'

import { useChartTheme } from '@/features/chart-builder/hooks/useChartTheme'

export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area'

/** Chart data item with name and numeric values */
interface ChartDataItem {
  name: string
  value?: number
  [key: string]: string | number | undefined
}

interface Props {
  type: ChartType
  data: ChartDataItem[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
}

export const ChartPreview = memo(function ChartPreview({
  type,
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  colors,
}: Props) {
  const theme = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme.palette.mode === 'dark'

  const { series, options } = useMemo(() => {
    if (!data || data.length === 0) {
      return { series: [], options: {} as ApexOptions }
    }

    const chartColors = colors || chartTheme.colors

    const isPie = type === 'pie' || type === 'donut'

    if (isPie) {
      return {
        series: data.map((d) => Number(d.value) || 0),
        options: {
          ...chartTheme,
          chart: { ...chartTheme.chart, type },
          labels: data.map((d) => d.name),
          colors: chartColors,
          legend: {
            ...chartTheme.legend,
            position: 'bottom' as const,
          },
          title: title
            ? {
                text: title,
                align: 'center' as const,
                style: { color: isDark ? '#fafafa' : '#09090b' },
              }
            : undefined,
        } as ApexOptions,
      }
    }

    // Check if data has multiple series (grouped data)
    const firstItem = data[0]
    const keys = Object.keys(firstItem).filter((k) => k !== 'name')
    const isMultiSeries = keys.length > 1 || (keys.length === 1 && keys[0] !== 'value')

    const chartSeries = isMultiSeries
      ? keys.map((key) => ({
          name: key,
          data: data.map((d) => {
            const val = d[key]
            return typeof val === 'number' ? val : Number(val) || 0
          }),
        }))
      : [{ name: yAxisLabel || 'Value', data: data.map((d) => Number(d.value) || 0) }]

    return {
      series: chartSeries,
      options: {
        ...chartTheme,
        chart: {
          ...chartTheme.chart,
          type: type === 'area' ? 'area' : type,
        },
        xaxis: {
          ...chartTheme.xaxis,
          categories: data.map((d) => d.name),
          title: xAxisLabel
            ? {
                text: xAxisLabel,
                style: { color: isDark ? '#a1a1aa' : '#71717a' },
              }
            : undefined,
        },
        yaxis: {
          ...chartTheme.yaxis,
          title: yAxisLabel
            ? {
                text: yAxisLabel,
                style: { color: isDark ? '#a1a1aa' : '#71717a' },
              }
            : undefined,
        },
        colors: chartColors,
        stroke: {
          ...chartTheme.stroke,
          width: type === 'area' ? 2 : 2,
        },
        fill:
          type === 'area'
            ? {
                type: 'gradient',
                gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.4,
                  opacityTo: 0.05,
                  stops: [0, 90, 100],
                },
              }
            : chartTheme.fill,
        title: title
          ? {
              text: title,
              align: 'center' as const,
              style: {
                color: isDark ? '#fafafa' : '#09090b',
                fontWeight: 600,
                fontSize: '14px',
              },
            }
          : undefined,
        legend: {
          ...chartTheme.legend,
          position: 'top' as const,
        },
      } as ApexOptions,
    }
  }, [type, data, title, xAxisLabel, yAxisLabel, colors, chartTheme, isDark])

  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Configure chart fields to see preview</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Chart
        type={type === 'donut' ? 'donut' : type === 'pie' ? 'pie' : type}
        series={series}
        options={options}
        height="100%"
      />
    </Paper>
  )
})
