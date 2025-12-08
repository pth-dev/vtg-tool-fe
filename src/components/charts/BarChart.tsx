import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { useTheme } from '@mui/material'
import { useChartTheme } from '../../hooks/useChartTheme'

interface Props {
  data: { name: string; count?: number; value?: number; percent?: number }[]
  color?: string
  horizontal?: boolean
  height?: number
  onClick?: (name: string) => void
  selected?: string
}

export default function BarChart({ data, color, horizontal = true, height = 280, onClick, selected }: Props) {
  const theme = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme.palette.mode === 'dark'
  
  const defaultColor = isDark ? '#60a5fa' : '#3b82f6'
  const barColor = color || defaultColor
  
  const values = data.map(d => d.count ?? d.value ?? 0)
  const colors = data.map(d => d.name === selected ? barColor : selected ? `${barColor}40` : barColor)

  const options: ApexOptions = {
    ...chartTheme,
    chart: { 
      ...chartTheme.chart,
      type: 'bar',
      events: onClick ? {
        dataPointSelection: (_, __, config) => {
          onClick(data[config.dataPointIndex].name)
        }
      } : undefined
    },
    plotOptions: { 
      bar: { 
        horizontal, 
        borderRadius: 4, 
        distributed: true,
        dataLabels: {
          position: 'top'
        }
      } 
    },
    xaxis: { 
      ...chartTheme.xaxis,
      categories: data.map(d => d.name) 
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
      style: {
        fontSize: '12px',
        colors: [isDark ? '#a1a1aa' : '#374151']
      }
    },
    tooltip: {
      ...chartTheme.tooltip,
      y: { formatter: (val) => `${val} orders` }
    }
  }

  return <Chart type="bar" options={options} series={[{ data: values }]} height={height} />
}
