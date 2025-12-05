import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

interface Props {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export default function AreaChart({ data, color = '#3b82f6', height = 320 }: Props) {
  const options: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    xaxis: { categories: data.map(d => d.label), labels: { rotate: -45, style: { fontSize: '10px' } } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: [color],
    dataLabels: { enabled: false }
  }
  return <Chart type="area" options={options} series={[{ name: 'Value', data: data.map(d => d.value) }]} height={height} />
}
