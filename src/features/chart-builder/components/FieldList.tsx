import { CalendarMonth, DragIndicator, Numbers, TextFields, ToggleOn } from '@mui/icons-material'
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material'

import { ColumnSchema } from '@/services/api'

interface Props {
  columns: ColumnSchema[]
  onDragStart: (column: ColumnSchema) => void
  onFieldClick?: (column: ColumnSchema) => void
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  string: <TextFields fontSize="small" />,
  number: <Numbers fontSize="small" />,
  date: <CalendarMonth fontSize="small" />,
  boolean: <ToggleOn fontSize="small" />,
}

const TYPE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  string: 'primary',
  number: 'success',
  date: 'warning',
  boolean: 'info',
}

// Get display type from detected_type or dtype
const getFieldType = (col: ColumnSchema): string => {
  if (col.detected_type) return col.detected_type

  // Use any to access dtype which may exist from backend
  const dtype = ((col as any).dtype || '').toLowerCase()
  if (dtype.includes('int') || dtype.includes('float')) return 'number'
  if (dtype.includes('datetime') || dtype.includes('date')) return 'date'
  if (dtype.includes('bool')) return 'boolean'
  return 'string'
}

export function FieldList({ columns, onDragStart, onFieldClick }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Categorize columns
  const dimensions = columns.filter((c) => {
    const type = getFieldType(c)
    return type === 'string' || type === 'date'
  })
  const measures = columns.filter((c) => {
    const type = getFieldType(c)
    return type === 'number' || type === 'boolean'
  })

  const renderField = (col: ColumnSchema) => {
    const fieldType = getFieldType(col)

    return (
      <ListItem
        key={col.name}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('field', JSON.stringify({ ...col, detected_type: fieldType }))
          onDragStart(col)
        }}
        onClick={() => onFieldClick?.(col)}
        sx={{
          cursor: 'grab',
          borderRadius: 1,
          mb: 0.5,
          bgcolor: isDark ? '#18181b' : 'background.paper',
          border: '1px solid',
          borderColor: isDark ? '#27272a' : 'divider',
          transition: 'all 0.15s',
          '&:hover': {
            bgcolor: isDark ? '#27272a' : 'action.hover',
            borderColor: isDark ? '#3f3f46' : 'primary.light',
            transform: 'translateX(4px)',
          },
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>
          <DragIndicator fontSize="small" sx={{ opacity: 0.5 }} />
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 32, color: TYPE_COLORS[fieldType] + '.main' }}>
          {TYPE_ICONS[fieldType]}
        </ListItemIcon>
        <ListItemText
          primary={col.name}
          primaryTypographyProps={{
            variant: 'body2',
            noWrap: true,
            sx: { fontWeight: 500 },
          }}
        />
        <Chip
          label={fieldType}
          size="small"
          color={TYPE_COLORS[fieldType]}
          variant="outlined"
          sx={{ height: 20, fontSize: 10, fontWeight: 500 }}
        />
      </ListItem>
    )
  }

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        overflow: 'auto',
        bgcolor: isDark ? '#0c0c0c' : 'background.paper',
      }}
    >
      {columns.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Select a dataset to see available fields
          </Typography>
        </Box>
      ) : (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1,
            }}
          >
            DIMENSIONS ({dimensions.length})
          </Typography>
          <List dense disablePadding sx={{ mb: 2 }}>
            {dimensions.map(renderField)}
          </List>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1,
            }}
          >
            MEASURES ({measures.length})
          </Typography>
          <List dense disablePadding>
            {measures.map(renderField)}
          </List>
        </>
      )}
    </Paper>
  )
}
