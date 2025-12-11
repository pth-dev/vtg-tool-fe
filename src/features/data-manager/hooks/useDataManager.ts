import { useCallback, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { IMPORT_WIZARD_STEPS, PAGINATION, SUCCESS_MESSAGES } from '@/constants'
import { api } from '@/services/api'
import { useNotification } from '@/shared/hooks'
import { getUserFriendlyMessage } from '@/shared/utils/error-parser'
import type { DataSource, Dataset } from '@/types'

interface UseDataManagerReturn {
  // Data
  datasets: Dataset[]
  totalCount: number
  // State
  page: number
  rowsPerPage: number
  search: string
  isLoading: boolean
  // Dialog states
  importDialogOpen: boolean
  previewDataset: Dataset | null
  deleteTarget: { id: number; name: string } | null
  // Import wizard state
  activeStep: number
  uploadedSource: DataSource | null
  datasetName: string
  dataType: 'dashboard' | 'isc'
  // Notification
  notification: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null
  // Loading states
  isDeleting: boolean
  isImporting: boolean
  // Actions
  setPage: (page: number) => void
  setRowsPerPage: (rows: number) => void
  setSearch: (search: string) => void
  openImportDialog: () => void
  closeImportDialog: () => void
  setPreviewDataset: (dataset: Dataset | null) => void
  setDeleteTarget: (target: { id: number; name: string } | null) => void
  handleUploadComplete: (source: DataSource) => void
  handleNextStep: () => void
  handleBackStep: () => void
  setDatasetName: (name: string) => void
  setDataType: (type: 'dashboard' | 'isc') => void
  handleCreateDataset: () => void
  handleDeleteDataset: (id?: number) => void
  clearNotification: () => void
}

/**
 * Hook for Data Manager state management
 */
export function useDataManager(): UseDataManagerReturn {
  const queryClient = useQueryClient()
  const { notification, showSuccess, showError, clearNotification } = useNotification()

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  // Import wizard state
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedSource, setUploadedSource] = useState<DataSource | null>(null)
  const [datasetName, setDatasetName] = useState('')
  const [dataType, setDataType] = useState<'dashboard' | 'isc'>('dashboard')

  // Fetch datasets
  const { data: datasetsResponse, isLoading } = useQuery({
    queryKey: ['datasets', page, rowsPerPage, search],
    queryFn: () => api.getDatasets(page + 1, rowsPerPage, search || undefined),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      showSuccess(SUCCESS_MESSAGES.DELETED)
      setDeleteTarget(null)
    },
    onError: (err: unknown) => showError(getUserFriendlyMessage(err)),
  })

  // Create dataset mutation
  const createMutation = useMutation({
    mutationFn: ({ sourceId, name }: { sourceId: number; name: string }) =>
      api.processDataset(sourceId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      showSuccess(SUCCESS_MESSAGES.IMPORTED)
      closeImportDialog()
    },
    onError: (err: unknown) => showError(getUserFriendlyMessage(err)),
  })

  // Actions
  const openImportDialog = useCallback(() => setImportDialogOpen(true), [])

  const closeImportDialog = useCallback(() => {
    setImportDialogOpen(false)
    setActiveStep(0)
    setUploadedSource(null)
    setDatasetName('')
    setDataType('dashboard')
  }, [])

  const handleUploadComplete = useCallback((source: DataSource) => {
    setUploadedSource(source)
    setDatasetName(source.name.replace(/\.[^/.]+$/, ''))
    setActiveStep(1)
  }, [])

  const handleNextStep = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, IMPORT_WIZARD_STEPS.length - 1))
  }, [])

  const handleBackStep = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleCreateDataset = useCallback(() => {
    if (!uploadedSource || !datasetName.trim()) return
    createMutation.mutate({ sourceId: uploadedSource.id, name: datasetName.trim() })
  }, [uploadedSource, datasetName])

  const handleDeleteDataset = useCallback((id?: number) => {
    const targetId = id || deleteTarget?.id
    if (!targetId) return
    deleteMutation.mutate(targetId)
  }, [deleteTarget])

  return {
    // Data
    datasets: datasetsResponse?.items || [],
    totalCount: datasetsResponse?.total || 0,
    // State
    page,
    rowsPerPage,
    search,
    isLoading,
    // Dialog states
    importDialogOpen,
    previewDataset,
    deleteTarget,
    // Import wizard state
    activeStep,
    uploadedSource,
    datasetName,
    dataType,
    // Notification
    notification,
    // Loading states
    isDeleting: deleteMutation.isPending,
    isImporting: createMutation.isPending,
    // Actions
    setPage,
    setRowsPerPage: (rows: number) => {
      setRowsPerPage(rows as typeof rowsPerPage)
      setPage(0)
    },
    setSearch: (s: string) => {
      setSearch(s)
      setPage(0)
    },
    openImportDialog,
    closeImportDialog,
    setPreviewDataset,
    setDeleteTarget,
    handleUploadComplete,
    handleNextStep,
    handleBackStep,
    setDatasetName,
    setDataType,
    handleCreateDataset,
    handleDeleteDataset,
    clearNotification,
  }
}

// Re-export for backward compatibility
export { IMPORT_WIZARD_STEPS as STEPS }
