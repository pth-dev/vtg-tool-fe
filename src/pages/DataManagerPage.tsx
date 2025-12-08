import { useState } from 'react'
import {
  Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stepper, Step, StepLabel, Typography, Alert,
  Snackbar, Table, TableHead, TableRow, TableCell, TableBody, IconButton, 
  Chip, TablePagination, InputAdornment
} from '@mui/material'
import { Add, Delete, Visibility, CheckCircle, Search, Storage } from '@mui/icons-material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { UploadDropzone, DataPreview } from '../components/data-manager'
import { api, DataSource, Dataset } from '../services/api'

const STEPS = ['Upload File', 'Preview Data', 'Finish Import']

export default function DataManagerPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedSource, setUploadedSource] = useState<DataSource | null>(null)
  const [datasetName, setDatasetName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null)
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [search, setSearch] = useState('')
  
  const queryClient = useQueryClient()

  // Fetch datasets
  const { data: datasetsResponse, isLoading } = useQuery({
    queryKey: ['datasets', page, rowsPerPage, search],
    queryFn: () => api.getDatasets(page + 1, rowsPerPage, search || undefined)
  })

  const datasets = datasetsResponse?.items || []
  const totalCount = datasetsResponse?.total || 0

  // Delete dataset mutation
  const deleteDatasetMutation = useMutation({
    mutationFn: (id: number) => api.deleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      setSuccessMsg('Dataset deleted successfully')
      setDeleteConfirm(null)
    },
    onError: (err: any) => setError(err.message)
  })

  // Create dataset mutation
  const createDatasetMutation = useMutation({
    mutationFn: ({ sourceId, name }: { sourceId: number; name: string }) => 
      api.processDataset(sourceId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      setSuccessMsg('Dataset imported successfully!')
      handleCloseDialog()
    },
    onError: (err: any) => setError(err.message)
  })

  const handleUploadComplete = (source: DataSource) => {
    setUploadedSource(source)
    setDatasetName(source.name.replace(/\.[^/.]+$/, ''))
    setActiveStep(1)
  }

  const handleCreateDataset = () => {
    if (!uploadedSource || !datasetName.trim()) return
    createDatasetMutation.mutate({ sourceId: uploadedSource.id, name: datasetName.trim() })
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setActiveStep(0)
    setUploadedSource(null)
    setDatasetName('')
    setError(null)
  }

  const handleNext = () => setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1))
  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Data Sources"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Import Data
          </Button>
        }
      />

      <Card>
        <CardContent>
          {/* Search */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
              }}
            />
          </Box>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Dataset Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Rows</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Columns</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
              ) : datasets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Storage sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography color="text.secondary" gutterBottom>No datasets yet</Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ mt: 1 }}>
                      Import your first dataset
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                datasets.map((d: Dataset) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Storage color="primary" fontSize="small" />
                        <Typography fontWeight={500}>{d.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={d.row_count?.toLocaleString() || '0'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{d.columns?.length || 0}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(d.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setPreviewDataset(d)} title="Preview">
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => setDeleteConfirm({ id: d.id, name: d.name })}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {datasets.length > 0 && (
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          )}
        </CardContent>
      </Card>

      {/* Import Dialog - Simplified to 3 steps */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

          <Box sx={{ minHeight: 400 }}>
            {activeStep === 0 && (
              <UploadDropzone onUploadComplete={handleUploadComplete} onError={setError} />
            )}

            {activeStep === 1 && uploadedSource && (
              <Box>
                <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                  ✅ File uploaded: <strong>{uploadedSource.name}</strong> ({uploadedSource.row_count?.toLocaleString()} rows, {uploadedSource.column_count} columns)
                </Alert>
                <DataPreview sourceId={uploadedSource.id} />
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
                <Typography variant="h6" gutterBottom>Name Your Dataset</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Give your dataset a name to use in charts and dashboards
                </Typography>
                <TextField
                  fullWidth
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. Sales Q4 2024"
                  sx={{ my: 2 }}
                  autoFocus
                />
                {uploadedSource && (
                  <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>📊 Import Summary</Typography>
                    <Typography variant="body2">📁 File: {uploadedSource.name}</Typography>
                    <Typography variant="body2">📈 Rows: {uploadedSource.row_count?.toLocaleString()}</Typography>
                    <Typography variant="body2">📋 Columns: {uploadedSource.column_count}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Box sx={{ flex: 1 }} />
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={activeStep === 0 && !uploadedSource}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateDataset}
              disabled={!datasetName.trim() || createDatasetMutation.isPending}
            >
              {createDatasetMutation.isPending ? 'Importing...' : 'Import Dataset'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDataset} onClose={() => setPreviewDataset(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Preview: {previewDataset?.name}</DialogTitle>
        <DialogContent>
          {previewDataset && <DataPreview datasetId={previewDataset.id} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDataset(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Dataset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This will permanently remove the dataset and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={() => deleteConfirm && deleteDatasetMutation.mutate(deleteConfirm.id)}
            disabled={deleteDatasetMutation.isPending}
          >
            {deleteDatasetMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </Box>
  )
}
