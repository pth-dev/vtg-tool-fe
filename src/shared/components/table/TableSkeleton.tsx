import { Box, Skeleton } from '@mui/material'

interface TableSkeletonProps {
  rows?: number
  headerHeight?: number
  rowHeight?: number
}

/**
 * Loading skeleton for tables
 */
export function TableSkeleton({ rows = 5, headerHeight = 40, rowHeight = 36 }: TableSkeletonProps) {
  return (
    <Box>
      <Skeleton variant="rectangular" height={headerHeight} sx={{ mb: 1 }} />
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={rowHeight} sx={{ mb: 0.5 }} />
      ))}
    </Box>
  )
}

