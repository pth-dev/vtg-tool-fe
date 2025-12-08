import { useCallback, useState } from 'react'
import { Box, Typography, LinearProgress, Alert } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { api, DataSource } from '../../services/api'

interface Props {
  onUploadComplete: (source: DataSource) => void
  onError?: (error: string) => void
}

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls', '.json']
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

export function UploadDropzone({ onUploadComplete, onError }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_TYPES.includes(ext)) {
      return `Unsupported file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`
    }
    if (file.size > MAX_SIZE) {
      return `File too large. Maximum size: 100MB`
    }
    return null
  }

  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    setError(null)
    setProgress(0)

    try {
      const result = await api.uploadFile(file, setProgress)
      setProgress(null)
      onUploadComplete(result)
    } catch (err: any) {
      setProgress(null)
      const msg = err.message || 'Upload failed'
      setError(msg)
      onError?.(msg)
    }
  }, [onUploadComplete, onError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }, [handleUpload])

  return (
    <Box>
      <Box
        component="label"
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          minHeight: 280,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          bgcolor: isDragging ? 'primary.50' : 'grey.50',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { 
            borderColor: 'primary.main', 
            bgcolor: 'primary.50',
          }
        }}
      >
        <input type="file" hidden accept={ACCEPTED_TYPES.join(',')} onChange={handleFileSelect} />
        <CloudUploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Drag & drop file here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse • CSV, Excel, JSON • Max 100MB
        </Typography>
      </Box>

      {progress !== null && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Uploading... {progress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
