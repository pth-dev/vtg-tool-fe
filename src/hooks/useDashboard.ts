import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

interface DashboardData {
  kpis: { total_orders: number; hold_count: number; failure_count: number; lock_count: number }
  charts: {
    by_status: { name: string; value: number }[]
    by_customer: { name: string; value: number }[]
    by_category: { name: string; value: number }[]
    trend: { date: string; count: number }[]
  }
  source_name?: string
}

export function useDashboard() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState<string[]>([])

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json())
  })

  const filteredCharts = useMemo(() => {
    if (!data) return null
    let charts = { ...data.charts }
    if (statusFilter !== 'all') charts.by_status = data.charts.by_status.filter(s => s.name === statusFilter)
    if (customerFilter.length) charts.by_customer = data.charts.by_customer.filter(c => customerFilter.includes(c.name))
    return charts
  }, [data, statusFilter, customerFilter])

  return {
    data,
    isLoading,
    charts: filteredCharts || data?.charts,
    customers: data?.charts.by_customer.map(c => c.name) ?? [],
    statusFilter,
    setStatusFilter,
    customerFilter,
    setCustomerFilter
  }
}
