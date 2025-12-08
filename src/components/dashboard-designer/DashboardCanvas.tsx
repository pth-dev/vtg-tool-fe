import { useMemo } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import { Box, Paper, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Close, DragIndicator } from '@mui/icons-material'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

export interface Widget {
  id: string
  type: 'chart' | 'text'
  chartId?: number
  chartName?: string
  content?: string
  x: number
  y: number
  w: number
  h: number
}

interface Props {
  widgets: Widget[]
  onLayoutChange: (widgets: Widget[]) => void
  onRemoveWidget: (id: string) => void
  onSelectWidget: (id: string | null) => void
  selectedWidgetId: string | null
  isPreview?: boolean
  renderChart?: (chartId: number) => React.ReactNode
}

export default function DashboardCanvas({ widgets, onLayoutChange, onRemoveWidget, onSelectWidget, selectedWidgetId, isPreview, renderChart }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  const cols = isMobile ? 4 : isTablet ? 8 : 12
  const width = isMobile ? 360 : isTablet ? 720 : 1140

  const layout: Layout[] = useMemo(() => 
    widgets.map(w => ({ i: w.id, x: w.x % cols, y: w.y, w: Math.min(w.w, cols), h: w.h, minW: 2, minH: 2 })), 
    [widgets, cols]
  )

  const handleLayoutChange = (newLayout: Layout[]) => {
    const updated = widgets.map(w => {
      const l = newLayout.find(n => n.i === w.id)
      return l ? { ...w, x: l.x, y: l.y, w: l.w, h: l.h } : w
    })
    onLayoutChange(updated)
  }

  return (
    <Box sx={{ flex: 1, bgcolor: '#f5f5f5', p: { xs: 1, sm: 2 }, minHeight: 600, overflow: 'auto' }}>
      <GridLayout
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={60}
        width={width}
        onLayoutChange={handleLayoutChange}
        isDraggable={!isPreview && !isMobile}
        isResizable={!isPreview && !isMobile}
        draggableHandle=".drag-handle"
      >
        {widgets.map(widget => (
          <Paper
            key={widget.id}
            elevation={selectedWidgetId === widget.id ? 4 : 1}
            onClick={() => !isPreview && onSelectWidget(widget.id)}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: selectedWidgetId === widget.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
              cursor: isPreview ? 'default' : 'pointer',
              overflow: 'hidden'
            }}
          >
            {!isPreview && (
              <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                <DragIndicator className="drag-handle" sx={{ cursor: 'move', color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="caption" sx={{ flex: 1, ml: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {widget.type === 'chart' ? widget.chartName : 'Text'}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemoveWidget(widget.id) }}>
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
            <Box sx={{ flex: 1, p: 1, overflow: 'hidden' }}>
              {widget.type === 'chart' && widget.chartId && renderChart?.(widget.chartId)}
              {widget.type === 'text' && (
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{widget.content || 'Text widget'}</Typography>
              )}
            </Box>
          </Paper>
        ))}
      </GridLayout>
    </Box>
  )
}
