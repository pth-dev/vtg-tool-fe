import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

interface Props {
  data: Record<string, any>[]
  xKey: string
  series: { key: string; name: string; color: string }[]
  height?: number
}

export default function LineChart({ data, xKey, series, height = 320 }: Props) {
  const options: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    xaxis: { 
      categories: data.map(d => d[xKey]),
      labels: { rotate: -45, style: { fontSize: '10px' } }
    },
    stroke: { curve: 'smooth', width: 2 },
    colors: series.map(s => s.color),
    legend: { position: 'top' },
    dataLabels: { enabled: false }
  }

  const chartSeries = series.map(s => ({
    name: s.name,
    data: data.map(d => d[s.key] || 0)
  }))

  return <Chart type="line" options={options} series={chartSeries} height={height} />
}
