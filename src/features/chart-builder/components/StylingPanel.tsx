import {
  Box,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'

import { CHART_PALETTES } from '@/constants'
import type { ColorPaletteName } from '@/constants'
import type { ChartStyling } from '@/types'

// Re-export type for backward compatibility
export type { ChartStyling }

interface Props {
  value: ChartStyling
  onChange: (styling: ChartStyling) => void
}

export function StylingPanel({ value, onChange }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const update = (key: keyof ChartStyling, val: any) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <Paper sx={{ p: 2, bgcolor: isDark ? '#0c0c0c' : 'background.paper' }}>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        Chart Styling
      </Typography>

      <TextField
        fullWidth
        size="small"
        label="Title"
        value={value.title}
        onChange={(e) => update('title', e.target.value)}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: isDark ? '#18181b' : 'white',
            '& fieldset': { borderColor: isDark ? '#27272a' : undefined },
          },
        }}
      />

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Color Palette
        </Typography>
        <Select
          fullWidth
          size="small"
          value={value.colorPalette}
          onChange={(e) => update('colorPalette', e.target.value)}
          sx={{
            bgcolor: isDark ? '#18181b' : 'white',
            '& fieldset': { borderColor: isDark ? '#27272a' : undefined },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: isDark ? '#18181b' : 'white',
                border: '1px solid',
                borderColor: isDark ? '#27272a' : 'divider',
              },
            },
          }}
        >
          {Object.entries(CHART_PALETTES).map(([key, colors]) => (
            <MenuItem key={key} value={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {colors.slice(0, 6).map((c, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: c,
                      borderRadius: 0.5,
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                  />
                ))}
                <Typography
                  variant="body2"
                  sx={{ ml: 1, textTransform: 'capitalize', fontWeight: 500 }}
                >
                  {key}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={value.showLegend}
            onChange={(e) => update('showLegend', e.target.checked)}
            size="small"
          />
        }
        label={<Typography variant="body2">Show Legend</Typography>}
        sx={{ mb: 1 }}
      />

      {value.showLegend && (
        <Select
          fullWidth
          size="small"
          value={value.legendPosition}
          onChange={(e) => update('legendPosition', e.target.value)}
          sx={{
            mb: 2,
            bgcolor: isDark ? '#18181b' : 'white',
            '& fieldset': { borderColor: isDark ? '#27272a' : undefined },
          }}
        >
          <MenuItem value="top">Top</MenuItem>
          <MenuItem value="bottom">Bottom</MenuItem>
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={value.showDataLabels}
            onChange={(e) => update('showDataLabels', e.target.checked)}
            size="small"
          />
        }
        label={<Typography variant="body2">Show Data Labels</Typography>}
      />
    </Paper>
  )
}

export const getColorPalette = (name: string): string[] => [
  ...(CHART_PALETTES[name as ColorPaletteName] || CHART_PALETTES.vtg),
]
