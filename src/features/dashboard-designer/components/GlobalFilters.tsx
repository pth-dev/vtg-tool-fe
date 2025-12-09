import { FilterList } from '@mui/icons-material'
import { Box, Chip, TextField } from '@mui/material'

interface FilterConfig {
  dateRange?: { start: string; end: string }
  dropdowns?: { field: string; values: string[] }[]
}

interface Props {
  filters: FilterConfig
  onChange: (filters: FilterConfig) => void
  isPreview?: boolean
}

export default function GlobalFilters({ filters, onChange, isPreview }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        bgcolor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <Chip icon={<FilterList />} label="Filters" size="small" variant="outlined" />

      <TextField
        type="date"
        size="small"
        label="From"
        InputLabelProps={{ shrink: true }}
        value={filters.dateRange?.start || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            dateRange: {
              ...filters.dateRange,
              start: e.target.value,
              end: filters.dateRange?.end || '',
            },
          })
        }
        disabled={isPreview}
        sx={{ width: 150 }}
      />
      <TextField
        type="date"
        size="small"
        label="To"
        InputLabelProps={{ shrink: true }}
        value={filters.dateRange?.end || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            dateRange: {
              ...filters.dateRange,
              end: e.target.value,
              start: filters.dateRange?.start || '',
            },
          })
        }
        disabled={isPreview}
        sx={{ width: 150 }}
      />
    </Box>
  )
}
