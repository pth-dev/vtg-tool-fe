import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Tabs, Tab, Alert } from '@mui/material'
import { Delete, ContentCopy, Link } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'

interface Props {
  open: boolean
  onClose: () => void
  dashboardId: number
  dashboardName: string
  isPublic: boolean
  publicToken?: string
}

export default function ShareDialog({ open, onClose, dashboardId, dashboardName, isPublic, publicToken }: Props) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState(0)
  const [userId, setUserId] = useState('')
  const [permission, setPermission] = useState('view')
  const [password, setPassword] = useState('')
  const [expiresIn, setExpiresIn] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: shares } = useQuery({
    queryKey: ['dashboard-shares', dashboardId],
    queryFn: () => api.getDashboardShares(dashboardId),
    enabled: open
  })

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers, enabled: open })

  const shareMutation = useMutation({
    mutationFn: (data: { userId: number; permission: string }) => api.shareDashboard(dashboardId, data.userId, data.permission),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dashboard-shares', dashboardId] }); setUserId('') }
  })

  const unshareMutation = useMutation({
    mutationFn: (uid: number) => api.unshareDashboard(dashboardId, uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-shares', dashboardId] })
  })

  const publishMutation = useMutation({
    mutationFn: (data: { password?: string; expiresAt?: string }) => api.publishDashboard(dashboardId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] })
  })

  const unpublishMutation = useMutation({
    mutationFn: () => api.unpublishDashboard(dashboardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] })
  })

  const publicUrl = publicToken ? `${window.location.origin}/public/${publicToken}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublish = () => {
    const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString() : undefined
    publishMutation.mutate({ password: password || undefined, expiresAt })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share "{dashboardName}"</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Users" />
          <Tab label="Public Link" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>User</InputLabel>
                <Select value={userId} onChange={(e) => setUserId(e.target.value)} label="User">
                  {users?.filter(u => !shares?.some(s => s.user_id === u.id)).map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ width: 100 }}>
                <InputLabel>Permission</InputLabel>
                <Select value={permission} onChange={(e) => setPermission(e.target.value)} label="Permission">
                  <MenuItem value="view">View</MenuItem>
                  <MenuItem value="edit">Edit</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => shareMutation.mutate({ userId: +userId, permission })} disabled={!userId}>
                Share
              </Button>
            </Box>

            <List dense>
              {shares?.map(s => (
                <ListItem key={s.user_id}>
                  <ListItemText primary={s.email} secondary={s.full_name} />
                  <Chip label={s.permission} size="small" sx={{ mr: 1 }} />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => unshareMutation.mutate(s.user_id)}><Delete /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {!shares?.length && <Typography color="text.secondary" sx={{ py: 2 }}>Not shared with anyone</Typography>}
            </List>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {isPublic ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>Dashboard is public</Alert>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField size="small" fullWidth value={publicUrl} InputProps={{ readOnly: true }} />
                  <Button startIcon={<ContentCopy />} onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</Button>
                </Box>
                <Button color="error" onClick={() => unpublishMutation.mutate()}>Unpublish</Button>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate a public link to share this dashboard with anyone
                </Typography>
                <TextField
                  size="small" fullWidth label="Password (optional)" type="password"
                  value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }}
                />
                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Expires in</InputLabel>
                  <Select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)} label="Expires in">
                    <MenuItem value="">Never</MenuItem>
                    <MenuItem value="1">1 day</MenuItem>
                    <MenuItem value="7">7 days</MenuItem>
                    <MenuItem value="30">30 days</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" startIcon={<Link />} onClick={handlePublish}>Generate Public Link</Button>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
