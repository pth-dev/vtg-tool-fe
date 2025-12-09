import { Clear, FilterAlt } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { FilterMultiSelect } from '@/shared/components/form/FilterMultiSelect'

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
  onChange: (
    key: 'month' | 'customers' | 'categories' | 'statuses' | 'products',
    value: string | string[]
  ) => void
  onClear: () => void
}

export default function FilterPanel({ filters, options, selectedMonth, onChange, onClear }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const hasFilters =
    filters.customers.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.products.length > 0

  const activeCount = [filters.customers, filters.categories, filters.statuses, filters.products].filter(
    (f) => f.length > 0
  ).length

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: isDark ? '#0c0c0c' : '#f8fafc',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        gap={2}
        alignItems={isMobile ? 'stretch' : 'center'}
      >
        {/* Filter Label */}
        <FilterLabel activeCount={activeCount} />

        {/* Mobile Clear Button */}
        {isMobile && hasFilters && <ClearButton onClick={onClear} />}

        {/* Filter Controls */}
        <Box display="flex" gap={1.5} flexWrap="wrap" flex={1}>
          {/* Month Select */}
          <MonthSelect
            value={filters.month || selectedMonth}
            options={options.months}
            onChange={(v) => onChange('month', v)}
            isMobile={isMobile}
            isDark={isDark}
          />

          {/* Multi-Selects */}
          <FilterMultiSelect
            label="Customer"
            value={filters.customers}
            options={options.customers}
            onChange={(v) => onChange('customers', v)}
            isMobile={isMobile}
            isDark={isDark}
          />
          <FilterMultiSelect
            label="Category"
            value={filters.categories}
            options={options.categories}
            onChange={(v) => onChange('categories', v)}
            isMobile={isMobile}
            isDark={isDark}
          />
          <FilterMultiSelect
            label="Status"
            value={filters.statuses}
            options={options.statuses}
            onChange={(v) => onChange('statuses', v)}
            isMobile={isMobile}
            isDark={isDark}
          />
          <FilterMultiSelect
            label="Product"
            value={filters.products}
            options={options.products}
            onChange={(v) => onChange('products', v)}
            isMobile={isMobile}
            isDark={isDark}
          />
        </Box>

        {/* Desktop Clear Button */}
        {!isMobile && hasFilters && <ClearButton onClick={onClear} isDark={isDark} />}
      </Box>
    </Paper>
  )
}

// Sub-components
function FilterLabel({ activeCount }: { activeCount: number }) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box display="flex" alignItems="center" gap={1} color="text.secondary">
      <FilterAlt fontSize="small" />
      <Box component="span" fontWeight={500} fontSize={14}>
        Filters
      </Box>
      {activeCount > 0 && (
        <Box
          component="span"
          sx={{
            bgcolor: 'primary.main',
            color: isDark ? '#09090b' : 'white',
            px: 1,
            py: 0.25,
            borderRadius: 10,
            fontSize: 12,
          }}
        >
          {activeCount}
        </Box>
      )}
    </Box>
  )
}

function ClearButton({ onClick, isDark = false }: { onClick: () => void; isDark?: boolean }) {
  return (
    <Button
      size="small"
      startIcon={<Clear />}
      onClick={onClick}
      sx={{
        color: 'text.secondary',
        '&:hover': {
          bgcolor: isDark ? 'rgba(220,38,38,0.1)' : '#fee2e2',
          color: '#dc2626',
        },
      }}
    >
      Clear
    </Button>
  )
}

function MonthSelect({
  value,
  options,
  onChange,
  isMobile,
  isDark,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  isMobile: boolean
  isDark: boolean
}) {
  return (
    <FormControl
      size="small"
      sx={{
        minWidth: isMobile ? '100%' : 120,
        flex: isMobile ? 1 : 'none',
        '& .MuiOutlinedInput-root': {
          bgcolor: isDark ? '#18181b' : 'white',
          borderRadius: 1.5,
          '& fieldset': { borderColor: isDark ? '#27272a' : '#e2e8f0' },
          '&:hover fieldset': { borderColor: isDark ? '#3f3f46' : '#cbd5e1' },
        },
      }}
    >
      <InputLabel sx={{ fontSize: 14 }}>Month</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        input={<OutlinedInput label="Month" />}
        sx={{ fontSize: 14 }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: isDark ? '#18181b' : 'white',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {options?.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
