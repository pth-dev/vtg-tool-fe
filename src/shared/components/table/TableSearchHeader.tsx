import { Search } from '@mui/icons-material'
import { Box, InputAdornment, TextField, Typography } from '@mui/material'

interface TableSearchHeaderProps {
  /** Info text displayed on the left (e.g., "100 rows • 5 columns") */
  info?: string
  /** Show search input */
  showSearch?: boolean
  /** Controlled search value */
  searchValue?: string
  /** Search placeholder */
  searchPlaceholder?: string
  /** Search width */
  searchWidth?: number
  /** Callback when search changes */
  onSearchChange?: (value: string) => void
}

/**
 * Table header with info and search input
 */
export function TableSearchHeader({
  info,
  showSearch = false,
  searchValue = '',
  searchPlaceholder = 'Search...',
  searchWidth = 250,
  onSearchChange,
}: TableSearchHeaderProps) {
  if (!info && !showSearch) return null

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {info && (
        <Typography variant="body2" color="text.secondary">
          {info}
        </Typography>
      )}
      {!info && <Box />}
      {showSearch && onSearchChange && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: searchWidth }}
        />
      )}
    </Box>
  )
}

