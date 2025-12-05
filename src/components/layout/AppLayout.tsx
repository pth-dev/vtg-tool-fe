import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Button, useMediaQuery, useTheme, IconButton } from '@mui/material'
import { Login, Logout, Menu } from '@mui/icons-material'
import { useAuthStore } from '../../stores/authStore'
import { getSidebarItems } from '../../config/navigation'

const DRAWER_WIDTH = 240
const DRAWER_COLLAPSED = 72

export default function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(isMobile)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const sidebarItems = getSidebarItems(isAdmin)

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

  const handleLogout = () => { logout(); navigate('/') }
  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH

  const drawerContent = (showText: boolean) => (
    <>
      {/* Header */}
      <Box
        sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        onClick={() => !isMobile && setCollapsed(!collapsed)}
      >
        <img 
          src={showText ? "/logo.f0f4e5c943afc7875feb.png" : "/favicon.png"} 
          alt="VTGTOOL" 
          style={{ height: showText ? 40 : 36 }} 
        />
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {sidebarItems.map(item => (
          <NavItem 
            key={item.path} 
            to={item.path} 
            icon={item.icon} 
            label={item.label} 
            collapsed={!showText}
            onClick={() => isMobile && setMobileOpen(false)}
          />
        ))}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        {user ? (
          <Button
            startIcon={<Logout />}
            onClick={handleLogout}
            size="small"
            color="inherit"
            sx={{ minWidth: 0, justifyContent: showText ? 'flex-start' : 'center', width: '100%' }}
          >
            {showText && 'Logout'}
          </Button>
        ) : (
          <Button
            component={NavLink}
            to="/login"
            startIcon={<Login />}
            size="small"
            color="inherit"
            sx={{ minWidth: 0, justifyContent: showText ? 'flex-start' : 'center', width: '100%' }}
          >
            {showText && 'Admin Login'}
          </Button>
        )}
      </Box>
    </>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile header */}
      {isMobile && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200, bgcolor: 'white', boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <img src="/logo.f0f4e5c943afc7875feb.png" alt="VTGTOOL" style={{ height: 32 }} />
          <IconButton onClick={() => setMobileOpen(true)}>
            <Menu />
          </IconButton>
        </Box>
      )}

      {/* Mobile Drawer - right side, always show text */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: '#ffffff',
            }
          }}
        >
          {drawerContent(true)}
        </Drawer>
      ) : (
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
          {drawerContent(!collapsed)}
        </Drawer>
      )}

      <Box component="main" sx={{ flex: 1, bgcolor: '#f8fafc', overflow: 'auto', pt: isMobile ? 7 : 0 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

function NavItem({ to, icon, label, collapsed, onClick }: { to: string; icon: React.ReactNode; label: string; collapsed: boolean; onClick?: () => void }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to === '/'}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        px: 2,
        py: 1,
        minHeight: 44,
        color: 'text.secondary',
        '&.active': { bgcolor: '#FBAD18', color: '#012E72', '& .MuiListItemIcon-root': { color: '#012E72' } },
        '&:hover': { bgcolor: '#f3f4f6' }
      }}
    >
      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{icon}</ListItemIcon>
      {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, noWrap: true }} />}
    </ListItemButton>
  )
}
