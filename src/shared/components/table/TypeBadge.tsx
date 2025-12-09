import { Chip } from '@mui/material'

const TYPE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'default'> = {
  string: 'primary',
  number: 'success',
  date: 'warning',
  boolean: 'info',
}

interface TypeBadgeProps {
  type: string
}

/**
 * Small badge showing data type (string, number, date, boolean)
 */
export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <Chip
      label={type}
      size="small"
      color={TYPE_COLORS[type] || 'default'}
      sx={{
        height: 20,
        fontSize: 11,
        fontWeight: 500,
        width: 'fit-content',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  )
}

/**
 * Get display type from column schema
 */
export function getDisplayType(schema: { detected_type?: string; dtype?: string }): string {
  if (schema.detected_type) return schema.detected_type

  const dtype = schema.dtype?.toLowerCase() || ''
  if (dtype.includes('int') || dtype.includes('float') || dtype.includes('number')) return 'number'
  if (dtype.includes('datetime') || dtype.includes('date')) return 'date'
  if (dtype.includes('bool')) return 'boolean'
  return 'string'
}

