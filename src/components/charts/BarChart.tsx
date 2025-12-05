import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

interface Props {
  data: { name: string; value: number }[]
  color?: string
  horizontal?: boolean
  height?: number
}

export default function BarChart({ data, color = '#3b82f6', horizontal = true, height = 280 }: Props) {
  const options: ApexOptions = {
    chart: { type: 'bar' },
    plotOptions: { bar: { horizontal, borderRadius: 4 } },
    xaxis: { categories: data.map(d => d.name) },
    colors: [color]
  }
  return <Chart type="bar" options={options} series={[{ data: data.map(d => d.value) }]} height={height} />
}
