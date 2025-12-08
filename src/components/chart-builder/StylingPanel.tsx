import { Box, TextField, Typography, FormControlLabel, Switch, Select, MenuItem, Paper } from '@mui/material'

export interface ChartStyling {
  title: string
  showLegend: boolean
  legendPosition: 'top' | 'bottom' | 'left' | 'right'
  showDataLabels: boolean
  colorPalette: string
}

interface Props {
  value: ChartStyling
  onChange: (styling: ChartStyling) => void
}

const COLOR_PALETTES = {
  vtg: ['#012E72', '#FBAD18', '#00A86B', '#E74C3C', '#9B59B6'],
  blue: ['#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB'],
  green: ['#43A047', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'],
  warm: ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5'],
}

export function StylingPanel({ value, onChange }: Props) {
  const update = (key: keyof ChartStyling, val: any) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Chart Styling</Typography>
      
      <TextField
        fullWidth
        size="small"
        label="Title"
        value={value.title}
        onChange={(e) => update('title', e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Color Palette</Typography>
        <Select
          fullWidth
          size="small"
          value={value.colorPalette}
          onChange={(e) => update('colorPalette', e.target.value)}
        >
          {Object.entries(COLOR_PALETTES).map(([key, colors]) => (
            <MenuItem key={key} value={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {colors.slice(0, 5).map((c, i) => (
                  <Box key={i} sx={{ width: 16, height: 16, bgcolor: c, borderRadius: 0.5 }} />
                ))}
                <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>{key}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>

      <FormControlLabel
        control={<Switch checked={value.showLegend} onChange={(e) => update('showLegend', e.target.checked)} size="small" />}
        label="Show Legend"
      />

      {value.showLegend && (
        <Select
          fullWidth
          size="small"
          value={value.legendPosition}
          onChange={(e) => update('legendPosition', e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        >
          <MenuItem value="top">Top</MenuItem>
          <MenuItem value="bottom">Bottom</MenuItem>
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      )}

      <FormControlLabel
        control={<Switch checked={value.showDataLabels} onChange={(e) => update('showDataLabels', e.target.checked)} size="small" />}
        label="Show Data Labels"
      />
    </Paper>
  )
}

export const getColorPalette = (name: string) => COLOR_PALETTES[name as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.vtg
