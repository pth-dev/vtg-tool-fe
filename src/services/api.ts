import { API_BASE_URL } from '@/constants'
import { parseApiError } from '@/shared/utils/error-parser'
import type {
  AuthResponse,
  Chart,
  ChartDataPoint,
  ColumnSchema,
  Dashboard,
  DashboardShare,
  DataSource,
  Dataset,
  PaginatedData,
  User,
  ValidationResult,
} from '@/types'

// Re-export types for backward compatibility
export type { ColumnSchema, DataSource, Dataset, PaginatedData, ValidationResult }

/**
 * Custom API Error with parsed message
 */
export class ApiError extends Error {
  public fieldErrors?: Record<string, string>
  public isValidationError: boolean
  public statusCode: number

  constructor(message: string, statusCode: number, fieldErrors?: Record<string, string>, isValidationError = false) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.fieldErrors = fieldErrors
    this.isValidationError = isValidationError
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    const parsed = parseApiError(errorText)
    throw new ApiError(parsed.message, res.status, parsed.fieldErrors, parsed.isValidationError)
  }

  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/auth/me'),

  // Users (admin only)
  getUsers: () => request<User[]>('/auth/users'),
  createUser: (data: { email: string; password: string; full_name: string; role: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: number) => request(`/auth/users/${id}`, { method: 'DELETE' }),

  // DataSources
  uploadFile: async (file: File, onProgress?: (percent: number) => void) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)

    return new Promise<DataSource>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE_URL}/datasources/upload`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(xhr.responseText))
        }
      }
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(formData)
    })
  },
  getDataSources: () => request<DataSource[]>('/datasources'),
  getDataSource: (id: number) => request<DataSource>(`/datasources/${id}`),
  previewDataSource: (id: number, rows = 100) =>
    request<{ columns: ColumnSchema[]; data: any[]; total_rows: number; preview_rows: number }>(
      `/datasources/${id}/preview?rows=${rows}`
    ),
  validateDataSource: (id: number) => request<ValidationResult>(`/datasources/${id}/validate`),
  getDataSourceSchema: (id: number) =>
    request<{ schema: ColumnSchema[] }>(`/datasources/${id}/schema`),
  deleteDataSource: (id: number) => request(`/datasources/${id}`, { method: 'DELETE' }),

  // Datasets
  getDatasets: (page = 1, pageSize = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (search) params.append('search', search)
    return request<{ items: Dataset[]; total: number; page: number; page_size: number }>(
      `/datasets?${params}`
    )
  },
  getDataset: (id: number) => request<Dataset>(`/datasets/${id}`),
  previewDataset: (id: number, rows = 100) =>
    request<{ columns: ColumnSchema[]; data: any[]; total_rows: number; preview_rows: number }>(
      `/datasets/${id}/preview?rows=${rows}`
    ),
  getDatasetData: (
    id: number,
    page = 1,
    pageSize = 50,
    sortBy?: string,
    sortOrder?: string,
    search?: string
  ) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (sortBy) params.append('sort_by', sortBy)
    if (sortOrder) params.append('sort_order', sortOrder)
    if (search) params.append('search', search)
    return request<PaginatedData>(`/datasets/${id}/data?${params}`)
  },
  processDataset: (sourceId: number, name: string) =>
    request<Dataset>(`/datasets/process?source_id=${sourceId}&name=${encodeURIComponent(name)}`, {
      method: 'POST',
    }),
  deleteDataset: (id: number) => request(`/datasets/${id}`, { method: 'DELETE' }),

  // Charts
  createChart: (data: { dataset_id: number; name: string; chart_type: string; config: any }) =>
    request<Chart>('/charts', { method: 'POST', body: JSON.stringify(data) }),
  getCharts: () => request<Chart[]>('/charts'),
  getChart: (id: number) => request<Chart>(`/charts/${id}`),
  getChartData: (id: number) =>
    request<{ chart_type: string; config: any; data: any[] }>(`/charts/${id}/data`),
  updateChart: (id: number, data: { name?: string; chart_type?: string; config?: any }) =>
    request(`/charts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChart: (id: number) => request(`/charts/${id}`, { method: 'DELETE' }),
  previewChart: (data: {
    dataset_id: number
    x_col: string
    y_col?: string
    agg?: string
    group_by?: string
  }) =>
    request<{ data: ChartDataPoint[] }>('/charts/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboards (Designer)
  getDashboards: () => request<Dashboard[]>('/dashboards'),
  createDashboard: (data: { name: string; description?: string }) =>
    request<{ id: number; name: string }>('/dashboards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDashboard: (id: number) => request<Dashboard>(`/dashboards/${id}`),
  updateDashboard: (id: number, data: { name?: string; description?: string; widgets?: any[] }) =>
    request(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDashboard: (id: number) => request(`/dashboards/${id}`, { method: 'DELETE' }),
  cloneDashboard: (id: number) =>
    request<{ id: number; name: string }>(`/dashboards/${id}/clone`, { method: 'POST' }),

  // Dashboard Sharing
  shareDashboard: (id: number, userId: number, permission: string) =>
    request(`/dashboards/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, permission }),
    }),
  unshareDashboard: (id: number, userId: number) =>
    request(`/dashboards/${id}/share/${userId}`, { method: 'DELETE' }),
  getDashboardShares: (id: number) => request<DashboardShare[]>(`/dashboards/${id}/shares`),
  publishDashboard: (id: number, data: { password?: string; expiresAt?: string }) =>
    request<{ public_token: string }>(`/dashboards/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ password: data.password, expires_at: data.expiresAt }),
    }),
  unpublishDashboard: (id: number) => request(`/dashboards/${id}/unpublish`, { method: 'POST' }),
  getPublicDashboard: (token: string, password?: string) =>
    request<Dashboard>(
      `/dashboards/public/${token}${password ? `?password=${encodeURIComponent(password)}` : ''}`
    ),

  // Export
  exportDatasetCsv: (id: number) => `${API_BASE_URL}/export/dataset/${id}/csv`,
  exportDatasetExcel: (id: number) => `${API_BASE_URL}/export/dataset/${id}/xlsx`,
  exportChartPng: (id: number) => `${API_BASE_URL}/export/chart/${id}/png`,
  exportChartSvg: (id: number) => `${API_BASE_URL}/export/chart/${id}/svg`,
  exportDashboardPdf: (id: number) => `${API_BASE_URL}/export/dashboard/${id}/pdf`,
}
