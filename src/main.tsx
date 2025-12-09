import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App'
import { useThemeStore } from './shared/stores/themeStore'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Dark mode palette matching shadcn-dashboard
const darkPalette = {
  mode: 'dark' as const,
  primary: { main: '#3b82f6', light: '#60a5fa', dark: '#1e40af' },
  secondary: { main: '#8b5cf6', light: '#a78bfa', dark: '#6d28d9' },
  error: { main: '#ef4444' },
  warning: { main: '#f59e0b' },
  success: { main: '#22c55e' },
  background: { default: '#0a0a0a', paper: '#171717' },
  text: { primary: '#fafafa', secondary: '#a1a1aa' },
  divider: '#27272a',
}

const lightPalette = {
  mode: 'light' as const,
  primary: { main: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
  secondary: { main: '#7c3aed' },
  background: { default: '#f8fafc', paper: '#ffffff' },
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)

  const theme = createTheme({
    palette: mode === 'dark' ? darkPalette : lightPalette,
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(mode === 'dark' && {
              backgroundColor: '#171717',
              borderColor: '#27272a',
            }),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? '#27272a' : undefined,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...(mode === 'dark' && {
              backgroundColor: '#171717',
              backgroundImage: 'none',
            }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(mode === 'dark' && {
              backgroundColor: '#0a0a0a',
              borderColor: '#27272a',
            }),
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeWrapper>
        <App />
      </ThemeWrapper>
    </QueryClientProvider>
  </StrictMode>
)
