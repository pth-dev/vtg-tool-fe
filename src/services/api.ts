const API_URL = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: number; email: string; full_name: string; role: string }>('/auth/me'),

  // Users (admin only)
  getUsers: () => request<any[]>('/auth/users'),
  createUser: (data: { email: string; password: string; full_name: string; role: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: number) => request(`/auth/users/${id}`, { method: 'DELETE' }),

  // DataSources
  uploadFile: async (file: File) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_URL}/datasources/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  getDataSources: () => request<any[]>('/datasources'),
  previewData: (id: number) => request<{ columns: string[]; data: any[] }>(`/datasources/${id}/preview`),
  deleteDataSource: (id: number) => request(`/datasources/${id}`, { method: 'DELETE' }),

  // Datasets
  getDatasets: () => request<any[]>('/datasets'),
  processDataset: (sourceId: number, name: string) =>
    request(`/datasets/process?source_id=${sourceId}&name=${encodeURIComponent(name)}`, { method: 'POST' }),
  getDatasetData: (id: number) => request<{ columns: any[]; data: any[] }>(`/datasets/${id}/data`),

  // Charts
  createChart: (data: { dataset_id: number; name: string; chart_type: string; config: any }) =>
    request('/charts', { method: 'POST', body: JSON.stringify(data) }),
  getCharts: () => request<any[]>('/charts'),
  getChartData: (id: number) => request<{ chart_type: string; config: any; data: any[] }>(`/charts/${id}/data`),
  deleteChart: (id: number) => request(`/charts/${id}`, { method: 'DELETE' }),
}
