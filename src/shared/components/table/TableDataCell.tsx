import { TableCell, Typography } from '@mui/material'

interface TableDataCellProps {
  value: unknown
  width?: number
  minWidth?: number
  maxWidth?: number
}

/**
 * Styled table data cell with null handling and ellipsis
 */
export function TableDataCell({ value, width = 140, minWidth = 100, maxWidth = 200 }: TableDataCellProps) {
  const displayValue = value === null || value === undefined ? null : String(value)

  return (
    <TableCell
      sx={{
        width,
        minWidth,
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        py: 1,
        px: 2,
        fontSize: 13,
      }}
      title={displayValue || ''}
    >
      {displayValue === null ? (
        <Typography variant="body2" color="text.disabled" fontStyle="italic" fontSize={13}>
          null
        </Typography>
      ) : (
        displayValue
      )}
    </TableCell>
  )
}

