import { Box, Divider, TextField, Typography } from '@mui/material'

import { Widget } from './DashboardCanvas'

interface Props {
  widget: Widget | null
  onUpdate: (id: string, updates: Partial<Widget>) => void
}

export default function PropertiesPanel({ widget, onUpdate }: Props) {
  if (!widget) {
    return (
      <Box sx={{ width: 240, borderLeft: '1px solid #e0e0e0', bgcolor: '#fff', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Select a widget to edit
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: 240, borderLeft: '1px solid #e0e0e0', bgcolor: '#fff', overflow: 'auto' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Properties
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Type: {widget.type === 'chart' ? `Chart - ${widget.chartName}` : 'Text'}
        </Typography>

        {widget.type === 'text' && (
          <TextField
            label="Content"
            multiline
            rows={4}
            size="small"
            value={widget.content || ''}
            onChange={(e) => onUpdate(widget.id, { content: e.target.value })}
          />
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="W"
            type="number"
            size="small"
            value={widget.w}
            onChange={(e) => onUpdate(widget.id, { w: +e.target.value })}
            sx={{ width: 70 }}
          />
          <TextField
            label="H"
            type="number"
            size="small"
            value={widget.h}
            onChange={(e) => onUpdate(widget.id, { h: +e.target.value })}
            sx={{ width: 70 }}
          />
        </Box>
      </Box>
    </Box>
  )
}
