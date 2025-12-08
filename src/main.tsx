import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import App from './App'
import './index.css'
import { useThemeStore } from './stores/themeStore'

// Brand colors
const PRIMARY = '#012E72'
const SECONDARY = '#FBAD18'

// Shadcn-inspired color palette
const shadcnColors = {
  light: {
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    cardForeground: '#09090b',
    popover: '#ffffff',
    popoverForeground: '#09090b',
    primary: PRIMARY,
    primaryForeground: '#fafafa',
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    accent: '#f4f4f5',
    accentForeground: '#18181b',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: PRIMARY,
  },
  dark: {
    background: '#09090b',
    foreground: '#fafafa',
    card: '#09090b',
    cardForeground: '#fafafa',
    popover: '#09090b',
    popoverForeground: '#fafafa',
    primary: '#fafafa',
    primaryForeground: '#18181b',
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    accent: '#27272a',
    accentForeground: '#fafafa',
    border: '#27272a',
    input: '#27272a',
    ring: '#d4d4d8',
  }
}

const getTheme = (mode: 'light' | 'dark') => {
  const colors = shadcnColors[mode]
  
  return createTheme({
    palette: {
      mode,
      primary: { 
        main: mode === 'light' ? PRIMARY : '#fafafa',
        light: mode === 'light' ? '#1a4a8a' : '#ffffff',
        dark: mode === 'light' ? '#001a4d' : '#d4d4d8',
        contrastText: mode === 'light' ? '#ffffff' : '#09090b'
      },
      secondary: { 
        main: SECONDARY,
        light: '#ffc94d',
        dark: '#c68a00',
        contrastText: '#000000'
      },
      background: { 
        default: colors.background, 
        paper: mode === 'light' ? colors.card : '#0c0c0c'
      },
      text: {
        primary: colors.foreground,
        secondary: colors.mutedForeground
      },
      divider: colors.border,
      success: {
        main: mode === 'light' ? '#22c55e' : '#4ade80',
        light: '#4ade80',
        dark: '#16a34a'
      },
      error: {
        main: mode === 'light' ? '#ef4444' : '#f87171',
        light: '#f87171',
        dark: '#dc2626'
      },
      warning: {
        main: mode === 'light' ? '#f59e0b' : '#fbbf24',
        light: '#fbbf24',
        dark: '#d97706'
      },
      info: {
        main: mode === 'light' ? '#3b82f6' : '#60a5fa',
        light: '#60a5fa',
        dark: '#2563eb'
      },
      action: {
        hover: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
        selected: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      }
    },
    typography: { 
      fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 600, letterSpacing: '-0.025em' },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.875rem' },
    },
    shape: {
      borderRadius: 6
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? '#27272a #09090b' : '#d4d4d8 #ffffff',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? '#09090b' : '#ffffff',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#27272a' : '#d4d4d8',
              borderRadius: '4px',
            },
          }
        }
      },
      MuiCard: { 
        styleOverrides: { 
          root: { 
            borderRadius: 8,
            boxShadow: 'none',
            border: `1px solid ${colors.border}`,
            backgroundColor: mode === 'dark' ? '#0c0c0c' : '#ffffff'
          } 
        } 
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${colors.border}`,
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 6,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.border}`,
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#fafafa' : '#0c0c0c',
            color: colors.mutedForeground,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
            }
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundImage: 'none'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#09090b',
            borderRight: `1px solid ${colors.border}`
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              '& fieldset': {
                borderColor: colors.border,
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? '#3f3f46' : '#a1a1aa',
              },
            }
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: mode === 'dark' ? '#fafafa' : PRIMARY,
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              color: mode === 'dark' ? '#fafafa' : PRIMARY,
            }
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? '#27272a' : '#18181b',
            color: '#fafafa',
            borderRadius: 6,
            fontSize: '0.75rem'
          }
        }
      }
    }
  })
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

function Root() {
  const mode = useThemeStore((s) => s.mode)
  const theme = React.useMemo(() => getTheme(mode), [mode])
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
