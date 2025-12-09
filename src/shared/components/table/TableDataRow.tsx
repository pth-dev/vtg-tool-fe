import { TableRow, useTheme } from '@mui/material'

import { TableDataCell } from './TableDataCell'

interface TableDataRowProps {
  row: Record<string, unknown>
  columns: string[]
  cellWidth?: number
}

/**
 * Styled table row with zebra striping and hover effect
 */
export function TableDataRow({ row, columns, cellWidth = 140 }: TableDataRowProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <TableRow
      hover
      sx={{
        '&:nth-of-type(odd)': {
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'grey.50',
        },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {columns.map((colName, j) => (
        <TableDataCell key={j} value={row[colName]} width={cellWidth} />
      ))}
    </TableRow>
  )
}

