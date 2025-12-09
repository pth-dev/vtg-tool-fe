import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Add, ContentCopy, Delete, Edit, MoreVert } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import { api } from '@/services/api'
import { PageHeader } from '@/shared/components/ui'
import { useConfirm } from '@/shared/stores'
import { dashboardSchema, type DashboardFormData } from '@/shared/validation'

export default function DashboardListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement
    id: number
    name: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DashboardFormData>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: { name: '' },
  })

  const { data: dashboards, isLoading } = useQuery({
    queryKey: ['dashboards'],
    queryFn: api.getDashboards,
  })

  const createMutation = useMutation({
    mutationFn: (data: DashboardFormData) => api.createDashboard(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      setCreateOpen(false)
      reset()
      setCreateError(null)
      navigate({ to: `/admin/dashboard-designer/${data.id}` })
    },
    onError: (error: Error) => {
      setCreateError(error.message)
    },
  })

  const cloneMutation = useMutation({
    mutationFn: (id: number) => api.cloneDashboard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteDashboard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] }),
  })

  const handleDeleteClick = () => {
    if (!menuAnchor) return
    const { id, name } = menuAnchor
    setMenuAnchor(null)
    confirm({
      title: 'Delete Dashboard',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'error',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id)
      },
    })
  }

  const handleClose = () => {
    setCreateOpen(false)
    reset()
    setCreateError(null)
  }

  const onSubmit = (data: DashboardFormData) => {
    createMutation.mutate(data)
  }

  return (
    <Box p={3}>
      <PageHeader
        title="Dashboards"
        subtitle="Create and manage your dashboards"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            New Dashboard
          </Button>
        }
      />

      <Grid container spacing={2}>
        {dashboards?.map((d) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.id}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate({ to: `/admin/dashboard-designer/${d.id}` })}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {d.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {d.updated_at ? new Date(d.updated_at).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuAnchor({ el: e.currentTarget, id: d.id, name: d.name })
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!isLoading && !dashboards?.length && (
          <Grid size={12}>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No dashboards yet. Create your first one!
            </Typography>
          </Grid>
        )}
      </Grid>

      <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            navigate({ to: `/admin/dashboard-designer/${menuAnchor?.id}` })
            setMenuAnchor(null)
          }}
        >
          <Edit sx={{ mr: 1, fontSize: 18 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            cloneMutation.mutate(menuAnchor!.id)
            setMenuAnchor(null)
          }}
        >
          <ContentCopy sx={{ mr: 1, fontSize: 18 }} /> Clone
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Create Dashboard</DialogTitle>
          <DialogContent>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            <TextField
              {...register('name')}
              autoFocus
              fullWidth
              label="Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
