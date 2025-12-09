import { useState } from 'react'

import { Close } from '@mui/icons-material'
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material'

import { ColumnSchema } from '@/services/api'

interface Props {
  label: string
  accepts: ('string' | 'number' | 'date' | 'boolean')[]
  value?: ColumnSchema | null
  onChange: (field: ColumnSchema | null) => void
  multiple?: boolean
  values?: ColumnSchema[]
  onMultiChange?: (fields: ColumnSchema[]) => void
}

export function DropZone({
  label,
  accepts,
  value,
  onChange,
  multiple,
  values = [],
  onMultiChange,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const data = e.dataTransfer.getData('field')
    if (!data) return

    const field: ColumnSchema = JSON.parse(data)
    const fieldType = field.detected_type || 'string'
    if (!accepts.includes(fieldType as any)) return

    if (multiple && onMultiChange) {
      if (!values.find((v) => v.name === field.name)) {
        onMultiChange([...values, field])
      }
    } else {
      onChange(field)
    }
  }

  const handleRemove = (fieldName?: string) => {
    if (multiple && onMultiChange && fieldName) {
      onMultiChange(values.filter((v) => v.name !== fieldName))
    } else {
      onChange(null)
    }
  }

  const hasValue = multiple ? values.length > 0 : !!value

  // Map accepts to display text
  const acceptsText = accepts
    .map((a) => {
      if (a === 'string') return 'text'
      if (a === 'number') return 'numeric'
      return a
    })
    .join('/')

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      sx={{
        p: 1.5,
        border: '2px dashed',
        borderColor: isDragOver
          ? 'primary.main'
          : hasValue
            ? isDark
              ? '#22c55e'
              : 'success.main'
            : isDark
              ? '#3f3f46'
              : 'grey.300',
        borderRadius: 1.5,
        bgcolor: isDragOver
          ? isDark
            ? 'rgba(59,130,246,0.1)'
            : 'action.hover'
          : hasValue
            ? isDark
              ? 'rgba(34,197,94,0.05)'
              : 'rgba(34,197,94,0.05)'
            : isDark
              ? '#18181b'
              : 'background.paper',
        minHeight: 56,
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: isDragOver ? 'primary.main' : isDark ? '#52525b' : 'grey.400',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          mb: 0.5,
          display: 'block',
          color: hasValue ? 'success.main' : 'text.secondary',
          fontWeight: hasValue ? 600 : 400,
        }}
      >
        {label}
      </Typography>

      {multiple ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {values.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              Drop {acceptsText} field here
            </Typography>
          ) : (
            values.map((v) => (
              <Chip
                key={v.name}
                label={v.name}
                size="small"
                onDelete={() => handleRemove(v.name)}
                color="primary"
                sx={{
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    fontSize: 16,
                  },
                }}
              />
            ))
          )}
        </Box>
      ) : value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={value.name} size="small" color="success" sx={{ fontWeight: 500 }} />
          <IconButton
            size="small"
            onClick={() => handleRemove()}
            sx={{
              p: 0.25,
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Drop {acceptsText} field here
        </Typography>
      )}
    </Box>
  )
}
