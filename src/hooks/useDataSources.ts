import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export function useDataSources() {
  const queryClient = useQueryClient()

  const query = useQuery({ queryKey: ['datasources'], queryFn: api.getDataSources })

  const uploadMutation = useMutation({
    mutationFn: api.uploadFile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['datasources'] })
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteDataSource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['datasources'] })
  })

  return {
    sources: query.data ?? [],
    isLoading: query.isLoading,
    uploadFile: uploadMutation.mutate,
    deleteSource: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    previewData: api.previewData
  }
}
