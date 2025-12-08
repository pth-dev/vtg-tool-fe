import { useState, useEffect } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, Skeleton, TablePagination, TextField, InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { api, PaginatedData } from '../../services/api'

interface Props {
  datasetId?: number
  sourceId?: number
  title?: string
}

const TYPE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  string: 'primary',
  number: 'success',
  date: 'warning',
  boolean: 'info'
}

// Map pandas dtype to display type
const getDisplayType = (schema: { detected_type?: string; dtype?: string }): string => {
  if (schema.detected_type) return schema.detected_type
  
  const dtype = schema.dtype?.toLowerCase() || ''
  if (dtype.includes('int') || dtype.includes('float') || dtype.includes('number')) return 'number'
  if (dtype.includes('datetime') || dtype.includes('date')) return 'date'
  if (dtype.includes('bool')) return 'boolean'
  return 'string'
}

export function DataPreview({ datasetId, sourceId, title }: Props) {
  const [data, setData] = useState<PaginatedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (datasetId) {
          const result = await api.getDatasetData(datasetId, page + 1, rowsPerPage, undefined, undefined, search || undefined)
          setData(result)
        } else if (sourceId) {
          const result = await api.previewDataSource(sourceId, 100)
          setData({
            columns: result.columns,
            data: result.data,
            total: result.total_rows,
            page: 1,
            page_size: result.preview_rows,
            total_pages: 1
          })
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      }
      setLoading(false)
    }
    fetchData()
  }, [datasetId, sourceId, page, rowsPerPage, search])

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={32} sx={{ mb: 0.5 }} />
        ))}
      </Box>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Paper>
    )
  }

  const columns = data.columns || []
  const columnNames = columns.length > 0 ? columns.map(c => c.name) : Object.keys(data.data[0] || {})

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>{title}</Typography>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {data.total.toLocaleString()} rows • {columnNames.length} columns
        </Typography>
        {datasetId && (
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            }}
            sx={{ width: 250 }}
          />
        )}
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500, border: '1px solid', borderColor: 'divider' }}>
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: columnNames.length * 150 }}>
          <TableHead>
            <TableRow>
              {columnNames.map((col, i) => {
                const schema = columns.find(c => c.name === col)
                return (
                  <TableCell 
                    key={i} 
                    sx={{ 
                      width: 150,
                      minWidth: 120,
                      maxWidth: 200,
                      fontWeight: 600,
                      bgcolor: 'grey.50',
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
                          whiteSpace: 'nowrap' 
                        }}
                        title={col}
                      >
                        {col}
                      </Typography>
                      {schema && (
                        (() => {
                          const displayType = getDisplayType(schema)
                          return (
                            <Chip
                              label={displayType}
                              size="small"
                              color={TYPE_COLORS[displayType] || 'default'}
                              sx={{ 
                                height: 20, 
                                fontSize: 11,
                                fontWeight: 500,
                                width: 'fit-content',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )
                        })()
                      )}
                    </Box>
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.data.map((row, i) => (
              <TableRow 
                key={i} 
                hover
                sx={{ 
                  '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                {columnNames.map((col, j) => (
                  <TableCell 
                    key={j} 
                    sx={{ 
                      width: 150,
                      minWidth: 120,
                      maxWidth: 200,
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      py: 1,
                      px: 2,
                      fontSize: 13,
                    }}
                    title={row[col] != null ? String(row[col]) : ''}
                  >
                    {row[col] === null || row[col] === undefined ? (
                      <Typography variant="body2" color="text.disabled" fontStyle="italic" fontSize={13}>
                        null
                      </Typography>
                    ) : (
                      String(row[col])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {datasetId && (
        <TablePagination
          component="div"
          count={data.total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
          rowsPerPageOptions={[25, 50, 100]}
        />
      )}
    </Box>
  )
}
