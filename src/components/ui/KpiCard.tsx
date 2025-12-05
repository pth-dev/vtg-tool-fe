import { Card, CardContent, Typography } from '@mui/material'

interface Props {
  title: string
  value: number | string
  color?: string
  percent?: number
}

export default function KpiCard({ title, value, color = '#3b82f6', percent }: Props) {
  return (
    <Card sx={{ borderLeft: 4, borderColor: color }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight={600}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        {percent !== undefined && (
          <Typography variant="caption" color="text.secondary">{percent.toFixed(1)}% of total</Typography>
        )}
      </CardContent>
    </Card>
  )
}
