import { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'
import { useChartTheme } from '@/features/dashboard/hooks/useChartTheme'

export interface RootCauseItem {
  root_cause: string
  count: number
  percent: number
  status?: string
  customer?: string
  category?: string
  improvement_plan?: string
}

export interface TreemapItem {
  name: string
  value: number
  percent: number
  children?: TreemapItem[]
}

interface Props {
  rootCauses: RootCauseItem[]
  treemapData: TreemapItem | null
  isMobile?: boolean
}

type DrillLevel = 'status' | 'customer' | 'category'

export function RootCauseAnalysis({ rootCauses, treemapData, isMobile = false }: Props) {
  const theme = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme.palette.mode === 'dark'

  const [drillPath, setDrillPath] = useState<{ level: DrillLevel; value: string }[]>([])
  const [selectedBar, setSelectedBar] = useState<string | null>(null)

  // Top 10 root causes for bar chart
  const top10 = useMemo(() => rootCauses.slice(0, 10), [rootCauses])

  // Current treemap data based on drill path
  const currentTreemapData = useMemo(() => {
    if (!treemapData) return []
    let current: TreemapItem[] = treemapData.children || []
    
    for (const { value } of drillPath) {
      const found = current.find((c) => c.name === value)
      if (found?.children) {
        current = found.children
      } else {
        break
      }
    }
    
    return current.map((item) => ({
      x: item.name,
      y: item.value,
      percent: item.percent,
      hasChildren: !!item.children?.length,
    }))
  }, [treemapData, drillPath])

  // Filtered root causes based on selection
  const filteredRootCauses = useMemo(() => {
    if (!selectedBar) return rootCauses.slice(0, 10)
    return rootCauses.filter((rc) => rc.root_cause === selectedBar).slice(0, 10)
  }, [rootCauses, selectedBar])

  // Bar chart options
  const barOptions: ApexOptions = {
    ...chartTheme,
    chart: { ...chartTheme.chart, type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '65%' },
    },
    colors: ['#ef4444'],
    xaxis: {
      ...chartTheme.xaxis,
      categories: top10.map((d) => d.root_cause.length > 25 ? d.root_cause.slice(0, 25) + '...' : d.root_cause),
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', colors: [isDark ? '#a1a1aa' : '#71717a'] },
        maxWidth: isMobile ? 120 : 180,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_, opt) => `${top10[opt.dataPointIndex].percent}%`,
      offsetX: 25,
      style: { fontSize: '11px', colors: [isDark ? '#e5e5e5' : '#374151'] },
    },
    tooltip: {
      ...chartTheme.tooltip,
      y: { formatter: (val) => `${val.toLocaleString()} cases` },
    },
  }

  // Treemap options
  const treemapOptions: ApexOptions = {
    ...chartTheme,
    chart: {
      ...chartTheme.chart,
      type: 'treemap',
      toolbar: { show: false },
      events: {
        dataPointSelection: (_, __, config) => {
          const item = currentTreemapData[config.dataPointIndex]
          if (item?.hasChildren) {
            const levels: DrillLevel[] = ['status', 'customer', 'category']
            const nextLevel = levels[drillPath.length]
            if (nextLevel) {
              setDrillPath([...drillPath, { level: nextLevel, value: item.x }])
            }
          }
        },
      },
    },
    colors: ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
        dataLabels: {
          format: 'truncate',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_, opt) => {
        const item = currentTreemapData[opt.dataPointIndex]
        return item ? `${item.x}\n${item.percent}%` : ''
      },
      style: { fontSize: '12px' },
    },
    tooltip: {
      ...chartTheme.tooltip,
      y: { formatter: (val) => `${val.toLocaleString()} cases` },
    },
  }

  const handleBarClick = (name: string) => {
    setSelectedBar(selectedBar === name ? null : name)
  }

  const handleBreadcrumbClick = (index: number) => {
    setDrillPath(drillPath.slice(0, index))
  }

  const levelLabels: Record<DrillLevel, string> = {
    status: 'Status',
    customer: 'Customer', 
    category: 'Category',
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Root Cause Analysis
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Click bars to filter • Click treemap to drill down
        </Typography>

        <Grid container spacing={2}>
          {/* Top 10 Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Top 10 Root Causes
            </Typography>
            <Box sx={{ height: isMobile ? 280 : 350 }}>
              <Chart
                type="bar"
                options={{
                  ...barOptions,
                  chart: {
                    ...barOptions.chart,
                    events: {
                      dataPointSelection: (_, __, config) => {
                        handleBarClick(top10[config.dataPointIndex].root_cause)
                      },
                    },
                  },
                }}
                series={[{ data: top10.map((d) => d.count) }]}
                height="100%"
              />
            </Box>
          </Grid>

          {/* Treemap with Drill-down */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1} flexWrap="wrap">
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Breakdown:
              </Typography>
              <Chip
                label="All"
                size="small"
                variant={drillPath.length === 0 ? 'filled' : 'outlined'}
                onClick={() => setDrillPath([])}
                sx={{ cursor: 'pointer' }}
              />
              {drillPath.map((p, i) => (
                <Chip
                  key={i}
                  label={`${levelLabels[p.level]}: ${p.value}`}
                  size="small"
                  variant={i === drillPath.length - 1 ? 'filled' : 'outlined'}
                  onClick={() => handleBreadcrumbClick(i + 1)}
                  onDelete={i === drillPath.length - 1 ? () => handleBreadcrumbClick(i) : undefined}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
            <Box sx={{ height: isMobile ? 250 : 320 }}>
              {currentTreemapData.length > 0 ? (
                <Chart
                  type="treemap"
                  options={treemapOptions}
                  series={[{ data: currentTreemapData }]}
                  height="100%"
                />
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No data</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Detail Table */}
          <Grid size={12}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {selectedBar ? `Details: ${selectedBar}` : 'Root Causes & Improvement Plans'}
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50', minWidth: 200 }}>
                      Root Cause
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
                      Count
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
                      %
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ fontWeight: 600, bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
                        Improvement Plan
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRootCauses.map((rc, i) => (
                    <TableRow key={i} hover selected={rc.root_cause === selectedBar}>
                      <TableCell sx={{ fontSize: 12 }}>{rc.root_cause}</TableCell>
                      <TableCell align="right">{rc.count.toLocaleString()}</TableCell>
                      <TableCell align="right">{rc.percent}%</TableCell>
                      {!isMobile && <TableCell sx={{ fontSize: 12 }}>{rc.improvement_plan || '-'}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
