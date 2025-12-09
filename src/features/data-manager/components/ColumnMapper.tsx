import { useState } from 'react'

import {
  Alert,
  Box,
  Chip,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'

import { ColumnSchema, ValidationResult } from '@/services/api'

interface Props {
  columns: ColumnSchema[]
  validation?: ValidationResult
  onMappingChange?: (mapping: ColumnMapping[]) => void
}

export interface ColumnMapping {
  name: string
  targetType: 'string' | 'number' | 'date' | 'boolean'
  include: boolean
}

const TYPE_OPTIONS = ['string', 'number', 'date', 'boolean'] as const

export function ColumnMapper({ columns, validation, onMappingChange }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [mapping, setMapping] = useState<ColumnMapping[]>(
    columns.map((col) => ({
      name: col.name,
      targetType: col.detected_type,
      include: true,
    }))
  )

  const handleTypeChange = (index: number, type: ColumnMapping['targetType']) => {
    const newMapping = [...mapping]
    newMapping[index].targetType = type
    setMapping(newMapping)
    onMappingChange?.(newMapping)
  }

  const handleIncludeChange = (index: number, include: boolean) => {
    const newMapping = [...mapping]
    newMapping[index].include = include
    setMapping(newMapping)
    onMappingChange?.(newMapping)
  }

  return (
    <Box>
      {validation && (
        <Box sx={{ mb: 2 }}>
          {validation.errors.map((err, i) => (
            <Alert key={i} severity="error" sx={{ mb: 1 }}>
              {err}
            </Alert>
          ))}
          {validation.warnings.map((warn, i) => (
            <Alert key={i} severity="warning" sx={{ mb: 1 }}>
              {warn}
            </Alert>
          ))}
          {validation.duplicate_rows > 0 && (
            <Alert severity="info" sx={{ mb: 1 }}>
              {validation.duplicate_rows} duplicate rows will be removed
            </Alert>
          )}
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: isDark ? '#1a1a1a' : 'grey.100' }}>
              <TableCell>Include</TableCell>
              <TableCell>Column Name</TableCell>
              <TableCell>Detected Type</TableCell>
              <TableCell>Target Type</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Sample Values</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.map((col, i) => (
              <TableRow key={col.name} sx={{ opacity: mapping[i]?.include ? 1 : 0.5 }}>
                <TableCell>
                  <Switch
                    checked={mapping[i]?.include ?? true}
                    onChange={(e) => handleIncludeChange(i, e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {col.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={col.detected_type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping[i]?.targetType ?? col.detected_type}
                    onChange={(e) =>
                      handleTypeChange(i, e.target.value as ColumnMapping['targetType'])
                    }
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    {TYPE_OPTIONS.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {col.unique_count} unique • {col.null_count} nulls
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {col.sample_values?.slice(0, 3).join(', ')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {mapping.filter((m) => m.include).length} of {columns.length} columns selected
        </Typography>
      </Box>
    </Box>
  )
}
