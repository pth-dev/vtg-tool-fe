import { useState } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { ColumnSchema } from '../../services/api'

interface Props {
  label: string
  accepts: ('string' | 'number' | 'date' | 'boolean')[]
  value?: ColumnSchema | null
  onChange: (field: ColumnSchema | null) => void
  multiple?: boolean
  values?: ColumnSchema[]
  onMultiChange?: (fields: ColumnSchema[]) => void
}

export function DropZone({ label, accepts, value, onChange, multiple, values = [], onMultiChange }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const data = e.dataTransfer.getData('field')
    if (!data) return
    
    const field: ColumnSchema = JSON.parse(data)
    if (!accepts.includes(field.detected_type)) return
    
    if (multiple && onMultiChange) {
      if (!values.find(v => v.name === field.name)) {
        onMultiChange([...values, field])
      }
    } else {
      onChange(field)
    }
  }

  const handleRemove = (fieldName?: string) => {
    if (multiple && onMultiChange && fieldName) {
      onMultiChange(values.filter(v => v.name !== fieldName))
    } else {
      onChange(null)
    }
  }

  const hasValue = multiple ? values.length > 0 : !!value

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      sx={{
        p: 1.5,
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : hasValue ? 'success.main' : 'grey.300',
        borderRadius: 1,
        bgcolor: isDragOver ? 'action.hover' : 'background.paper',
        minHeight: 48,
        transition: 'all 0.2s'
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      
      {multiple ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {values.length === 0 ? (
            <Typography variant="body2" color="text.disabled">
              Drop {accepts.join('/')} fields here
            </Typography>
          ) : (
            values.map(v => (
              <Chip
                key={v.name}
                label={v.name}
                size="small"
                onDelete={() => handleRemove(v.name)}
                color="primary"
              />
            ))
          )}
        </Box>
      ) : (
        value ? (
          <Chip
            label={value.name}
            size="small"
            onDelete={() => handleRemove()}
            color="primary"
          />
        ) : (
          <Typography variant="body2" color="text.disabled">
            Drop {accepts.join('/')} field here
          </Typography>
        )
      )}
    </Box>
  )
}
