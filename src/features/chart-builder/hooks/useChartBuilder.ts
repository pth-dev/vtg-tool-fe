import { useCallback, useEffect, useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ColumnSchema, api } from '@/services/api'
import { useDebounce } from '@/shared/hooks'

import type { ChartStyling } from '@/types'

// Chart types
type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area'
type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

interface UseChartBuilderReturn {
  // State
  selectedDataset: number | null
  chartType: ChartType | 'table' | 'kpi'
  xAxis: ColumnSchema | null
  yAxis: ColumnSchema | null
  groupBy: ColumnSchema | null
  aggregation: AggregationType
  chartName: string
  styling: ChartStyling
  error: string | null
  // Derived data
  columns: ColumnSchema[]
  previewData: any[]
  datasets: any[]
  // Loading states
  isDatasetLoading: boolean
  isPreviewLoading: boolean
  isSaving: boolean
  // Actions
  setSelectedDataset: (id: number | null) => void
  setChartType: (type: ChartType | 'table' | 'kpi') => void
  setXAxis: (col: ColumnSchema | null) => void
  setYAxis: (col: ColumnSchema | null) => void
  setGroupBy: (col: ColumnSchema | null) => void
  setAggregation: (agg: AggregationType) => void
  setChartName: (name: string) => void
  setStyling: (styling: ChartStyling) => void
  setError: (error: string | null) => void
  handleDatasetChange: (id: number) => void
  handleFieldClick: (field: ColumnSchema) => void
  handleRefreshPreview: () => void
  handleSave: () => void
}

/**
 * Hook for Chart Builder state management
 * Extracts all state and logic from ChartBuilderPage
 */
export function useChartBuilder(): UseChartBuilderReturn {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null)
  const [chartType, setChartType] = useState<ChartType | 'table' | 'kpi'>('bar')
  const [xAxis, setXAxis] = useState<ColumnSchema | null>(null)
  const [yAxis, setYAxis] = useState<ColumnSchema | null>(null)
  const [groupBy, setGroupBy] = useState<ColumnSchema | null>(null)
  const [aggregation, setAggregation] = useState<AggregationType>('sum')
  const [chartName, setChartName] = useState('')
  const [styling, setStyling] = useState<ChartStyling>({
    title: '',
    showLegend: true,
    legendPosition: 'top' as const,
    showDataLabels: false,
    colorPalette: 'vtg',
  })
  const [previewData, setPreviewData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Debounced config for auto-preview
  const debouncedConfig = useDebounce(
    {
      selectedDataset,
      xAxis: xAxis?.name,
      yAxis: yAxis?.name,
      aggregation,
      groupBy: groupBy?.name,
    },
    500
  )

  // Queries
  const { data: datasetsData } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => api.getDatasets(1, 100),
  })

  const { data: datasetDetail, isLoading: isDatasetLoading } = useQuery({
    queryKey: ['dataset', selectedDataset],
    queryFn: () => api.getDataset(selectedDataset!),
    enabled: !!selectedDataset,
  })

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (params: {
      dataset_id: number
      x_col: string
      y_col?: string
      agg: string
      group_by?: string
    }) => api.previewChart(params),
    onSuccess: (data) => setPreviewData(data.data),
    onError: (err: any) => setError(err.message),
  })

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: { dataset_id: number; name: string; chart_type: string; config: any }) =>
      api.createChart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charts'] })
      navigate({ to: '/admin/charts' })
    },
    onError: (err: any) => setError(err.message),
  })

  // Debounced auto-preview
  useEffect(() => {
    if (debouncedConfig.selectedDataset && debouncedConfig.xAxis) {
      previewMutation.mutate({
        dataset_id: debouncedConfig.selectedDataset,
        x_col: debouncedConfig.xAxis,
        y_col: debouncedConfig.yAxis,
        agg: debouncedConfig.aggregation,
        group_by: debouncedConfig.groupBy,
      })
    }
  }, [debouncedConfig])

  // Handlers
  const handleDatasetChange = useCallback((datasetId: number) => {
    setSelectedDataset(datasetId)
    setXAxis(null)
    setYAxis(null)
    setGroupBy(null)
    setPreviewData([])
  }, [])

  const handleFieldClick = useCallback(
    (field: ColumnSchema) => {
      const fieldType = field.detected_type || 'string'

      if (fieldType === 'number') {
        if (!yAxis) {
          setYAxis(field)
        }
      } else {
        if (!xAxis) {
          setXAxis(field)
        } else if (!groupBy) {
          setGroupBy(field)
        }
      }
    },
    [xAxis, yAxis, groupBy]
  )

  const handleRefreshPreview = useCallback(() => {
    if (selectedDataset && xAxis) {
      previewMutation.mutate({
        dataset_id: selectedDataset,
        x_col: xAxis.name,
        y_col: yAxis?.name,
        agg: aggregation,
        group_by: groupBy?.name,
      })
    }
  }, [selectedDataset, xAxis, yAxis, aggregation, groupBy])

  const handleSave = useCallback(() => {
    if (!selectedDataset || !xAxis || !chartName.trim()) {
      setError('Please fill in all required fields (Dataset, X-Axis, Chart Name)')
      return
    }

    saveMutation.mutate({
      dataset_id: selectedDataset,
      name: chartName.trim(),
      chart_type: chartType,
      config: {
        x_col: xAxis.name,
        y_col: yAxis?.name,
        agg: aggregation,
        group_by: groupBy?.name,
        styling,
      },
    })
  }, [selectedDataset, xAxis, yAxis, chartName, chartType, aggregation, groupBy, styling])

  return {
    // State
    selectedDataset,
    chartType,
    xAxis,
    yAxis,
    groupBy,
    aggregation,
    chartName,
    styling,
    error,
    // Derived data
    columns: datasetDetail?.columns || [],
    previewData,
    datasets: datasetsData?.items || [],
    // Loading states
    isDatasetLoading,
    isPreviewLoading: previewMutation.isPending,
    isSaving: saveMutation.isPending,
    // Actions
    setSelectedDataset,
    setChartType,
    setXAxis,
    setYAxis,
    setGroupBy,
    setAggregation,
    setChartName,
    setStyling,
    setError,
    handleDatasetChange,
    handleFieldClick,
    handleRefreshPreview,
    handleSave,
  }
}
