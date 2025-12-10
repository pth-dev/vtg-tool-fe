import { useCallback, useState } from 'react'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Alert, Box, LinearProgress, Typography, useTheme } from '@mui/material'

import { ERROR_MESSAGES, FILE_UPLOAD } from '@/constants'
import { api } from '@/services/api'
import type { DataSource } from '@/types'

interface Props {
  onUploadComplete: (source: DataSource) => void
  onError?: (error: string) => void
  dataType?: 'dashboard' | 'isc'
}

export function UploadDropzone({ onUploadComplete, onError, dataType = 'dashboard' }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(ext as any)) {
      return `${ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE}. Accepted: ${FILE_UPLOAD.ACCEPTED_TYPES.join(', ')}`
    }
    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
      return `${ERROR_MESSAGES.FILE_TOO_LARGE}. Maximum size: ${FILE_UPLOAD.MAX_SIZE_DISPLAY}`
    }
    return null
  }

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        onError?.(validationError)
        return
      }

      setError(null)
      setProgress(0)

      try {
        const result = await api.uploadFile(file, setProgress, dataType)
        setProgress(null)
        onUploadComplete(result)
      } catch (err: any) {
        setProgress(null)
        // Parse friendly error message
        let msg: string = ERROR_MESSAGES.NETWORK_ERROR
        if (err.message) {
          // Map technical errors to user-friendly messages
          if (err.message.includes("'int' object") || err.message.includes("'float' object")) {
            msg = 'File contains invalid data format. Please check column headers.'
          } else if (err.message.includes('Unsupported file type')) {
            msg = 'Unsupported file type. Please use CSV, Excel, or JSON.'
          } else if (err.message.includes('column') || err.message.includes('Column')) {
            msg = err.message
          } else if (err.message.length < 100 && !err.message.includes('{')) {
            msg = err.message
          }
        }
        setError(msg)
        onError?.(msg)
      }
    },
    [onUploadComplete, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUpload(file)
    },
    [handleUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
      e.target.value = ''
    },
    [handleUpload]
  )

  return (
    <Box>
      <Box
        component="label"
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault()
          setIsDragging(true)
        }}
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
          borderColor: isDragging ? 'primary.main' : isDark ? '#3f3f46' : 'grey.400',
          borderRadius: 2,
          bgcolor: isDragging
            ? isDark ? 'rgba(59, 130, 246, 0.1)' : 'primary.50'
            : isDark ? '#18181b' : 'grey.50',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'primary.50',
          },
        }}
      >
        <input
          type="file"
          hidden
          accept={FILE_UPLOAD.ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
        />
        <CloudUploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Drag & drop file here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse • CSV, Excel, JSON • Max {FILE_UPLOAD.MAX_SIZE_DISPLAY}
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
