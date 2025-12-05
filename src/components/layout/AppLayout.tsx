import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Button } from '@mui/material'
import { Dashboard, Storage, Login, Logout, People } from '@mui/icons-material'
import { useAuthStore } from '../../stores/authStore'

const DRAWER_WIDTH = 240
const DRAWER_COLLAPSED = 72

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width,
          transition: 'width 0.2s',
          '& .MuiDrawer-paper': {
            width,
            transition: 'width 0.2s',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            overflowX: 'hidden'
          }
        }}
      >
        {/* Header - Click to toggle */}
        <Box
          sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <img src="/favicon.png" alt="VTGTOOL" style={{ height: 36 }} />
          ) : (
            <img src="/logo.f0f4e5c943afc7875feb.png" alt="VTGTOOL" style={{ height: 40 }} />
          )}
        </Box>

        <Divider />

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1, py: 2 }}>
          <NavItem to="/" icon={<Dashboard />} label="Dashboard" collapsed={collapsed} />
          {isAdmin && <NavItem to="/admin/datasources" icon={<Storage />} label="Data Management" collapsed={collapsed} />}
          {isAdmin && <NavItem to="/admin/users" icon={<People />} label="Users" collapsed={collapsed} />}
        </List>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 2 }}>
          {user ? (
            <>
              {!collapsed && <Typography variant="caption" color="text.secondary" display="block" mb={1}>{user.email}</Typography>}
              <Button
                startIcon={<Logout />}
                onClick={handleLogout}
                size="small"
                color="inherit"
                sx={{ minWidth: 0, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%' }}
              >
                {!collapsed && 'Logout'}
              </Button>
            </>
          ) : (
            <Button
              component={NavLink}
              to="/login"
              startIcon={<Login />}
              size="small"
              color="inherit"
              sx={{ minWidth: 0, justifyContent: collapsed ? 'center' : 'flex-start', width: '100%' }}
            >
              {!collapsed && 'Admin Login'}
            </Button>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, bgcolor: '#f8fafc', overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  )
}

function NavItem({ to, icon, label, collapsed }: { to: string; icon: React.ReactNode; label: string; collapsed: boolean }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to === '/'}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 1 : 2,
        color: 'text.secondary',
        '&.active': {
          bgcolor: '#FBAD18',
          color: '#012E72',
          '& .MuiListItemIcon-root': { color: '#012E72' }
        },
        '&:hover': { bgcolor: '#f3f4f6' }
      }}
    >
      <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>{icon}</ListItemIcon>
      {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />}
    </ListItemButton>
  )
}
