import { Card, CardContent, Typography } from '@mui/material'

interface Props {
  title: string
  value: number | string
  color?: string
  suffix?: string
  subtitle?: string
}

export default function KpiCard({ title, value, color = '#3b82f6', suffix, subtitle }: Props) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value
  
  return (
    <Card sx={{ borderLeft: 4, borderColor: color, height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" noWrap>{title}</Typography>
        <Typography variant="h4" fontWeight={600}>
          {displayValue}{suffix}
        </Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  )
}
