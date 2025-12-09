import { useMemo, useState } from 'react'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

interface Filters {
  month: string
  customers: string[]
  categories: string[]
  statuses: string[]
  products: string[]
}

interface DashboardData {
  kpis: {
    total_orders: number
    resume_rate: number
    failed_rate: number
    top_category: { name: string; percent: number }
    top_customer: { name: string; percent: number }
  }
  charts: {
    by_customer: { name: string; count: number; percent: number }[]
    by_category: { name: string; count: number; percent: number }[]
    by_status: { name: string; count: number; percent: number }[]
    trend: Record<string, any>[]
  }
  root_causes: { root_cause: string; count: number; percent: number; improvement_plan: string }[]
  filters: {
    months: string[]
    customers: string[]
    categories: string[]
    statuses: string[]
    products: string[]
  }
  selected_month: string
  source_name?: string
}

export function useDashboard() {
  const [filters, setFilters] = useState<Filters>({
    month: '',
    customers: [],
    categories: [],
    statuses: [],
    products: [],
  })

  const [crossFilter, setCrossFilter] = useState<{ type: string; value: string } | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.month) params.set('month', filters.month)
    if (filters.customers.length) params.set('customers', filters.customers.join(','))
    if (filters.categories.length) params.set('categories', filters.categories.join(','))
    if (filters.statuses.length) params.set('statuses', filters.statuses.join(','))
    if (filters.products.length) params.set('products', filters.products.join(','))
    return params.toString()
  }, [filters])

  const { data, isLoading, isFetching } = useQuery<DashboardData>({
    queryKey: ['dashboard', queryString],
    queryFn: () => fetch(`/api/dashboard?${queryString}`).then((r) => r.json()),
    staleTime: 30000,
    placeholderData: keepPreviousData, // Keep showing old data while fetching new
  })

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCrossFilter = (type: string, value: string) => {
    if (crossFilter?.type === type && crossFilter?.value === value) {
      setCrossFilter(null)
      if (type === 'customer') updateFilter('customers', [])
      if (type === 'category') updateFilter('categories', [])
    } else {
      setCrossFilter({ type, value })
      if (type === 'customer') updateFilter('customers', [value])
      if (type === 'category') updateFilter('categories', [value])
    }
  }

  const clearFilters = () => {
    setFilters((prev) => ({ ...prev, customers: [], categories: [], statuses: [], products: [] }))
    setCrossFilter(null)
  }

  return {
    data,
    isLoading,
    isFetching,
    filters,
    filterOptions: data?.filters,
    selectedMonth: data?.selected_month,
    crossFilter,
    updateFilter,
    toggleCrossFilter,
    clearFilters,
  }
}
