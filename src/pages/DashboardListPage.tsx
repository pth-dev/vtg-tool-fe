import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Button, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem } from '@mui/material'
import { Add, MoreVert, Edit, ContentCopy, Delete } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { PageHeader } from '../components/ui'

export default function DashboardListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: number } | null>(null)

  const { data: dashboards, isLoading } = useQuery({ queryKey: ['dashboards'], queryFn: api.getDashboards })

  const createMutation = useMutation({
    mutationFn: (name: string) => api.createDashboard({ name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      setCreateOpen(false)
      setNewName('')
      navigate(`/dashboard-designer/${data.id}`)
    }
  })

  const cloneMutation = useMutation({
    mutationFn: (id: number) => api.cloneDashboard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] })
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteDashboard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] })
  })

  return (
    <Box p={3}>
      <PageHeader
        title="Dashboards"
        subtitle="Create and manage your dashboards"
        action={<Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>New Dashboard</Button>}
      />

      <Grid container spacing={2}>
        {dashboards?.map(d => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.id}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(`/dashboard-designer/${d.id}`)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{d.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(d.updated_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor({ el: e.currentTarget, id: d.id }) }}>
                    <MoreVert />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!isLoading && !dashboards?.length && (
          <Grid size={12}>
            <Typography color="text.secondary" textAlign="center" py={4}>No dashboards yet. Create your first one!</Typography>
          </Grid>
        )}
      </Grid>

      <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { navigate(`/dashboard-designer/${menuAnchor?.id}`); setMenuAnchor(null) }}>
          <Edit sx={{ mr: 1, fontSize: 18 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { cloneMutation.mutate(menuAnchor!.id); setMenuAnchor(null) }}>
          <ContentCopy sx={{ mr: 1, fontSize: 18 }} /> Clone
        </MenuItem>
        <MenuItem onClick={() => { deleteMutation.mutate(menuAnchor!.id); setMenuAnchor(null) }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Create Dashboard</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate(newName)} disabled={!newName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
