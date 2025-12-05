import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

interface Props {
  data: { name: string; count?: number; value?: number; percent?: number }[]
  color?: string
  horizontal?: boolean
  height?: number
  onClick?: (name: string) => void
  selected?: string
}

export default function BarChart({ data, color = '#3b82f6', horizontal = true, height = 280, onClick, selected }: Props) {
  const values = data.map(d => d.count ?? d.value ?? 0)
  const maxValue = Math.max(...values)
  const colors = data.map(d => d.name === selected ? color : selected ? `${color}40` : color)

  const options: ApexOptions = {
    chart: { 
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
    xaxis: { categories: data.map(d => d.name) },
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
        colors: ['#374151']
      }
    },
    tooltip: {
      y: { formatter: (val) => `${val} orders` }
    }
  }

  return <Chart type="bar" options={options} series={[{ data: values }]} height={height} />
}
