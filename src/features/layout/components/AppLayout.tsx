import { ReactNode, useEffect, useState } from 'react'

import { Link, Outlet, useNavigate } from '@tanstack/react-router'

import { Login, Logout } from '@mui/icons-material'
import { Box, Button, Divider, Drawer, List, useMediaQuery, useTheme } from '@mui/material'

import { getSidebarItems } from '@/config/navigation'
import { LAYOUT } from '@/constants'
import { useAuthStore } from '@/features/auth'
import { AnimatedLogo, MobileHeader, NavItem } from '@/features/layout/components'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'

const LOGO_FULL = '/logo.f0f4e5c943afc7875feb.png'

interface Props {
  children?: ReactNode
}

export default function AppLayout({ children }: Props) {
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

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  const width = collapsed ? LAYOUT.DRAWER_COLLAPSED_WIDTH : LAYOUT.DRAWER_WIDTH

  const drawerContent = (showText: boolean, useAnimatedLogo = false) => (
    <>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: !isMobile ? 'pointer' : 'default',
          minHeight: 64,
          transition: 'all 0.2s ease',
          '&:hover': !isMobile ? { bgcolor: 'action.hover' } : {},
        }}
        onClick={() => !isMobile && setCollapsed(!collapsed)}
      >
        {useAnimatedLogo ? (
          <AnimatedLogo expanded={showText} />
        ) : (
          <Box
            component="img"
            src={LOGO_FULL}
            alt="VTGTOOL"
            sx={{ height: 36, width: 'auto', maxWidth: 180, objectFit: 'contain' }}
          />
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {sidebarItems.map((item) => (
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <ThemeToggle />
        </Box>
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
            component={Link}
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
      {isMobile && <MobileHeader onMenuClick={() => setMobileOpen(true)} />}

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: LAYOUT.DRAWER_WIDTH,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent(true, false)}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiDrawer-paper': {
              width,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent(!collapsed, true)}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          bgcolor: 'background.default',
          overflow: 'auto',
          pt: isMobile ? 7 : 0,
          minHeight: '100vh',
        }}
      >
        {children || <Outlet />}
      </Box>
    </Box>
  )
}
