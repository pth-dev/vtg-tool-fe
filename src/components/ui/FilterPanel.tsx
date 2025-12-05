import { Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Checkbox, ListItemText, Paper, useMediaQuery, useTheme } from '@mui/material'
import { FilterAlt, Clear } from '@mui/icons-material'

interface Props {
  filters: {
    month: string
    customers: string[]
    categories: string[]
    statuses: string[]
    products: string[]
  }
  options: {
    months: string[]
    customers: string[]
    categories: string[]
    statuses: string[]
    products: string[]
  }
  selectedMonth: string
  onChange: (key: 'month' | 'customers' | 'categories' | 'statuses' | 'products', value: any) => void
  onClear: () => void
}

export default function FilterPanel({ filters, options, selectedMonth, onChange, onClear }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const hasFilters = filters.customers.length > 0 || filters.categories.length > 0 || filters.statuses.length > 0 || filters.products.length > 0
  const activeCount = [filters.customers, filters.categories, filters.statuses, filters.products].filter(f => f.length > 0).length

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems={isMobile ? 'stretch' : 'center'}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} color="text.secondary">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterAlt fontSize="small" />
            <Box component="span" fontWeight={500} fontSize={14}>Filters</Box>
            {activeCount > 0 && (
              <Box component="span" sx={{ bgcolor: 'primary.main', color: 'white', px: 1, py: 0.25, borderRadius: 10, fontSize: 12 }}>
                {activeCount}
              </Box>
            )}
          </Box>
          {isMobile && hasFilters && (
            <Button size="small" startIcon={<Clear />} onClick={onClear} sx={{ color: 'text.secondary' }}>
              Clear
            </Button>
          )}
        </Box>
        
        <Box display="flex" gap={1.5} flexWrap="wrap" flex={1}>
          <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 120, flex: isMobile ? 1 : 'none', '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 1.5 } }}>
            <InputLabel sx={{ fontSize: 14 }}>Month</InputLabel>
            <Select
              value={filters.month || selectedMonth || ''}
              onChange={e => onChange('month', e.target.value)}
              input={<OutlinedInput label="Month" />}
              sx={{ fontSize: 14 }}
            >
              {options.months?.map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <MultiSelect label="Customer" value={filters.customers} options={options.customers} onChange={v => onChange('customers', v)} isMobile={isMobile} />
          <MultiSelect label="Category" value={filters.categories} options={options.categories} onChange={v => onChange('categories', v)} isMobile={isMobile} />
          <MultiSelect label="Status" value={filters.statuses} options={options.statuses} onChange={v => onChange('statuses', v)} isMobile={isMobile} />
          <MultiSelect label="Product" value={filters.products} options={options.products} onChange={v => onChange('products', v)} isMobile={isMobile} />
        </Box>
        
        {!isMobile && hasFilters && (
          <Button size="small" startIcon={<Clear />} onClick={onClear} sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#fee2e2', color: '#dc2626' } }}>
            Clear
          </Button>
        )}
      </Box>
    </Paper>
  )
}

function MultiSelect({ label, value, options, onChange, isMobile }: { label: string; value: string[]; options: string[]; onChange: (v: string[]) => void; isMobile?: boolean }) {
  const isActive = value.length > 0
  
  return (
    <FormControl size="small" sx={{ minWidth: isMobile ? 'calc(50% - 6px)' : 120, flex: isMobile ? 1 : 'none', '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 1.5, ...(isActive && { bgcolor: '#eff6ff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6', borderWidth: 2 } }) } }}>
      <InputLabel sx={{ fontSize: 14 }}>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={e => onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
        input={<OutlinedInput label={label} />}
        renderValue={selected => selected.length === 1 ? selected[0] : `${selected.length} selected`}
        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
        sx={{ fontSize: 14 }}
      >
        {options?.map(opt => (
          <MenuItem key={opt} value={opt} dense>
            <Checkbox checked={value.includes(opt)} size="small" />
            <ListItemText primary={opt} primaryTypographyProps={{ fontSize: 13 }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
