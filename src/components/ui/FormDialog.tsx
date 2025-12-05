import { ReactNode } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  onSubmit: () => void
  submitLabel?: string
  loading?: boolean
  error?: string
  children: ReactNode
}

export default function FormDialog({ open, onClose, title, onSubmit, submitLabel = 'Save', loading, error, children }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
