import { Component, ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { ErrorOutline, Refresh, Home } from '@mui/icons-material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={4} bgcolor="#f8fafc">
      <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" fontWeight={600} gutterBottom>Something went wrong</Typography>
      <Typography color="text.secondary" mb={3} textAlign="center" maxWidth={400}>
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </Typography>
      <Box display="flex" gap={2}>
        <Button variant="contained" startIcon={<Refresh />} onClick={onRetry}>
          Try Again
        </Button>
        <Button variant="outlined" startIcon={<Home />} onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </Box>
    </Box>
  )
}

export default ErrorBoundary
