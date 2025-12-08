import { Typography, Paper, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { TextFields, Numbers, CalendarMonth, ToggleOn } from '@mui/icons-material'
import { ColumnSchema } from '../../services/api'

interface Props {
  columns: ColumnSchema[]
  onDragStart: (column: ColumnSchema) => void
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  string: <TextFields fontSize="small" />,
  number: <Numbers fontSize="small" />,
  date: <CalendarMonth fontSize="small" />,
  boolean: <ToggleOn fontSize="small" />
}

const TYPE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  string: 'primary',
  number: 'success',
  date: 'warning',
  boolean: 'info'
}

export function FieldList({ columns, onDragStart }: Props) {
  const dimensions = columns.filter(c => c.detected_type === 'string' || c.detected_type === 'date')
  const measures = columns.filter(c => c.detected_type === 'number' || c.detected_type === 'boolean')

  const renderField = (col: ColumnSchema) => (
    <ListItem
      key={col.name}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('field', JSON.stringify(col))
        onDragStart(col)
      }}
      sx={{
        cursor: 'grab',
        borderRadius: 1,
        mb: 0.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' },
        '&:active': { cursor: 'grabbing' }
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {TYPE_ICONS[col.detected_type]}
      </ListItemIcon>
      <ListItemText
        primary={col.name}
        primaryTypographyProps={{ variant: 'body2', noWrap: true }}
      />
      <Chip
        label={col.detected_type}
        size="small"
        color={TYPE_COLORS[col.detected_type]}
        sx={{ height: 18, fontSize: 10 }}
      />
    </ListItem>
  )

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        DIMENSIONS
      </Typography>
      <List dense disablePadding>
        {dimensions.map(renderField)}
      </List>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
        MEASURES
      </Typography>
      <List dense disablePadding>
        {measures.map(renderField)}
      </List>
    </Paper>
  )
}
