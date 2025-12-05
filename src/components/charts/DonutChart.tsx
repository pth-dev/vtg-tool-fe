import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

interface Props {
  data: { name: string; value: number }[]
  colors?: string[]
  height?: number
}

export default function DonutChart({ data, colors = ['#3b82f6', '#ef4444', '#8b5cf6'], height = 280 }: Props) {
  const options: ApexOptions = {
    labels: data.map(d => d.name),
    colors,
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` }
  }
  return <Chart type="donut" options={options} series={data.map(d => d.value)} height={height} />
}
