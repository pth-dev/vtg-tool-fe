import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'

interface RootCause {
  root_cause: string
  count: number
  percent: number
  improvement_plan?: string
}

interface RootCausesTableProps {
  data: RootCause[]
  isMobile?: boolean
}

/**
 * Root causes and improvement plans table
 */
export function RootCausesTable({ data, isMobile = false }: RootCausesTableProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  if (!data || data.length === 0) return null

  const displayData = data.slice(0, isMobile ? 10 : 20)

  return (
    <Card>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Root Causes & Improvement Plans
        </Typography>
        <Box sx={{ maxHeight: isMobile ? 300 : 350, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    minWidth: isMobile ? 150 : 200,
                    bgcolor: isDark ? '#1a1a1a' : 'grey.50',
                  }}
                >
                  Root Cause
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
                  Count
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
                  %
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
                    Improvement Plan
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((rc, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontSize: 13 }}>{rc.root_cause}</TableCell>
                  <TableCell align="right">{rc.count}</TableCell>
                  <TableCell align="right">{rc.percent}%</TableCell>
                  {!isMobile && <TableCell sx={{ fontSize: 13 }}>{rc.improvement_plan}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  )
}

