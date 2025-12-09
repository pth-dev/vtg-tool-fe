import { Box, TableCell, Typography, useTheme } from '@mui/material'

import { TypeBadge, getDisplayType } from './TypeBadge'

export interface ColumnSchema {
  name: string
  detected_type?: string
  dtype?: string
}

interface TableHeaderCellProps {
  column: ColumnSchema | string
  showType?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
}

/**
 * Styled table header cell with optional type badge
 */
export function TableHeaderCell({
  column,
  showType = false,
  width = 140,
  minWidth = 100,
  maxWidth = 200,
}: TableHeaderCellProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const colName = typeof column === 'string' ? column : column.name
  const schema = typeof column === 'string' ? null : column

  return (
    <TableCell
      sx={{
        width,
        minWidth,
        maxWidth,
        fontWeight: 600,
        bgcolor: isDark ? '#1a1a1a' : 'grey.50',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        py: 1.5,
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={colName}
        >
          {colName}
        </Typography>
        {showType && schema && <TypeBadge type={getDisplayType(schema)} />}
      </Box>
    </TableCell>
  )
}

