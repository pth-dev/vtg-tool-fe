import { useCallback, useEffect, useRef, useState } from 'react'

import { Box, useTheme } from '@mui/material'

import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'

import { useChartTheme } from '@/features/chart-builder/hooks/useChartTheme'
import { ChartContextMenu } from '@/shared/components/ui/ChartContextMenu'

interface DataItem {
  name: string
  count?: number
  value?: number
  percent?: number
}

interface Props {
  data: DataItem[]
  color?: string
  horizontal?: boolean
  height?: number
  onClick?: (name: string) => void
  onShowData?: (name: string) => void
  selected?: string
}

export default function BarChart({
  data,
  color,
  horizontal = true,
  height = 280,
  onClick,
  onShowData,
  selected,
}: Props) {
  const theme = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme.palette.mode === 'dark'
  const chartRef = useRef<HTMLDivElement>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    position: { top: number; left: number }
    dataIndex: number
  } | null>(null)

  const defaultColor = isDark ? '#60a5fa' : '#3b82f6'
  const barColor = color || defaultColor
  const values = data.map((d) => d.count ?? d.value ?? 0)
  const colors = data.map((d) =>
    d.name === selected ? barColor : selected ? `${barColor}40` : barColor
  )

  // Calculate max label length for dynamic padding
  const maxLabelLength = Math.max(...data.map((d) => d.name.length), 1)
  const yAxisWidth = Math.min(Math.max(maxLabelLength * 7, 80), 150)

  // Handle right-click on chart bars
  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      if (event.button !== 2 || !onShowData) return

      event.preventDefault()
      event.stopPropagation()

      const chartElement = chartRef.current
      if (!chartElement) return

      const rect = chartElement.getBoundingClientRect()
      const y = event.clientY - rect.top
      const chartAreaTop = 40
      const chartAreaHeight = rect.height - chartAreaTop - 30
      const adjustedY = y - chartAreaTop

      if (adjustedY < 0 || adjustedY > chartAreaHeight) return

      const barHeight = chartAreaHeight / data.length
      const dataIndex = Math.floor(adjustedY / barHeight)

      if (dataIndex >= 0 && dataIndex < data.length) {
        setContextMenu({
          position: { top: event.clientY, left: event.clientX },
          dataIndex,
        })
      }
    },
    [data.length, onShowData]
  )

  // Prevent default browser context menu
  useEffect(() => {
    const chartElement = chartRef.current
    if (!chartElement || !onShowData) return

    const preventDefaultContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      handleContextMenu(e)
    }

    chartElement.addEventListener('contextmenu', preventDefaultContextMenu)
    return () => chartElement.removeEventListener('contextmenu', preventDefaultContextMenu)
  }, [handleContextMenu, onShowData])

  const handleCloseContextMenu = () => setContextMenu(null)

  const handleShowData = () => {
    if (contextMenu && onShowData) {
      onShowData(data[contextMenu.dataIndex].name)
    }
    handleCloseContextMenu()
  }

  const handleFilter = () => {
    if (contextMenu && onClick) {
      onClick(data[contextMenu.dataIndex].name)
    }
    handleCloseContextMenu()
  }

  const options: ApexOptions = {
    ...chartTheme,
    chart: {
      ...chartTheme.chart,
      type: 'bar',
      events: onClick
        ? {
            dataPointSelection: (event, _, config) => {
              if (event && (event as MouseEvent).button === 2) return
              onClick(data[config.dataPointIndex].name)
            },
          }
        : undefined,
    },
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        distributed: true,
        dataLabels: { position: 'top' },
        barHeight: '70%',
      },
    },
    xaxis: {
      ...chartTheme.xaxis,
      categories: data.map((d) => d.name),
      labels: {
        ...chartTheme.xaxis?.labels,
        style: { fontSize: '12px', colors: isDark ? '#a1a1aa' : '#71717a' },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: [isDark ? '#a1a1aa' : '#71717a'] },
        maxWidth: yAxisWidth,
        formatter: (val: string | number) => {
          const str = String(val)
          return str.length > 15 ? str.substring(0, 15) + '...' : str
        },
      },
    },
    colors,
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val, opt) => {
        const percent = data[opt.dataPointIndex].percent
        return percent !== undefined ? `${percent}%` : `${val}`
      },
      offsetX: horizontal ? 30 : 0,
      offsetY: horizontal ? 0 : -20,
      style: { fontSize: '12px', colors: [isDark ? '#a1a1aa' : '#374151'] },
    },
    tooltip: {
      ...chartTheme.tooltip,
      y: { formatter: (val) => `${val.toLocaleString()} orders` },
    },
    grid: {
      ...chartTheme.grid,
      padding: { left: 10, right: 10 },
    },
  }

  return (
    <Box ref={chartRef} sx={{ position: 'relative' }}>
      <Chart type="bar" options={options} series={[{ data: values }]} height={height} />

      <ChartContextMenu
        anchorPosition={contextMenu?.position || null}
        data={contextMenu ? data[contextMenu.dataIndex] : null}
        onShowData={onShowData ? handleShowData : undefined}
        onFilter={onClick ? handleFilter : undefined}
        onClose={handleCloseContextMenu}
      />
    </Box>
  )
}
