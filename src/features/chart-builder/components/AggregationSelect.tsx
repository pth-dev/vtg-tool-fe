import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

interface Props {
  value: AggregationType
  onChange: (agg: AggregationType) => void
  size?: 'small' | 'medium'
}

const AGGREGATIONS: { value: AggregationType; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
]

export function AggregationSelect({ value, onChange, size = 'small' }: Props) {
  return (
    <FormControl size={size} fullWidth>
      <InputLabel>Aggregation</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as AggregationType)}
        label="Aggregation"
      >
        {AGGREGATIONS.map(({ value: v, label }) => (
          <MenuItem key={v} value={v}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
