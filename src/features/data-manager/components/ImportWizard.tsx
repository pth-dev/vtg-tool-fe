import { CheckCircle } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'

import { DataPreview, UploadDropzone } from '@/features/data-manager/components'
import { IMPORT_WIZARD_STEPS } from '@/constants'
import type { DataSource } from '@/types'

interface ImportWizardProps {
  open: boolean
  activeStep: number
  uploadedSource: DataSource | null
  datasetName: string
  isImporting: boolean
  dataType: 'dashboard' | 'isc'
  onClose: () => void
  onUploadComplete: (source: DataSource) => void
  onUploadError: (error: string) => void
  onNext: () => void
  onBack: () => void
  onDatasetNameChange: (name: string) => void
  onDataTypeChange: (type: 'dashboard' | 'isc') => void
  onImport: () => void
}

export function ImportWizard({
  open,
  activeStep,
  uploadedSource,
  datasetName,
  isImporting,
  dataType,
  onClose,
  onUploadComplete,
  onUploadError,
  onNext,
  onBack,
  onDatasetNameChange,
  onDataTypeChange,
  onImport,
}: ImportWizardProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Import Data</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {IMPORT_WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {/* Step 1: Upload */}
          {activeStep === 0 && (
            <Box>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={dataType}
                  label="Data Type"
                  onChange={(e) => onDataTypeChange(e.target.value as 'dashboard' | 'isc')}
                >
                  <MenuItem value="dashboard">Dashboard (Lock/Hold/Failed)</MenuItem>
                  <MenuItem value="isc">ISC DO System</MenuItem>
                </Select>
              </FormControl>
              <UploadDropzone onUploadComplete={onUploadComplete} onError={onUploadError} dataType={dataType} />
            </Box>
          )}

          {/* Step 2: Preview */}
          {activeStep === 1 && uploadedSource && (
            <Box>
              <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
                File uploaded: <strong>{uploadedSource.name}</strong> (
                {uploadedSource.row_count?.toLocaleString()} rows, {uploadedSource.column_count}{' '}
                columns)
              </Alert>
              <DataPreview sourceId={uploadedSource.id} />
            </Box>
          )}

          {/* Step 3: Finish */}
          {activeStep === 2 && (
            <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Name Your Dataset
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Give your dataset a name to use in charts and dashboards
              </Typography>
              <TextField
                fullWidth
                value={datasetName}
                onChange={(e) => onDatasetNameChange(e.target.value)}
                placeholder="e.g. Sales Q4 2024"
                sx={{ my: 2 }}
                autoFocus
              />
              {uploadedSource && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Import Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    File: {uploadedSource.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rows: {uploadedSource.row_count?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Columns: {uploadedSource.column_count}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && <Button onClick={onBack}>Back</Button>}
        {activeStep < IMPORT_WIZARD_STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={activeStep === 0 && !uploadedSource}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={onImport}
            disabled={!datasetName.trim() || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import Dataset'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
