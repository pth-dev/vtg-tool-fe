import { Menu } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'

import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'

const LOGO_FULL = '/logo.f0f4e5c943afc7875feb.png'

interface MobileHeaderProps {
  onMenuClick: () => void
}

/**
 * Mobile header component with logo and menu toggle
 */
export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: 'background.paper',
        boxShadow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        component="img"
        src={LOGO_FULL}
        alt="VTGTOOL"
        sx={{
          height: 28,
          width: 'auto',
          objectFit: 'contain',
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ThemeToggle />
        <IconButton onClick={onMenuClick}>
          <Menu />
        </IconButton>
      </Box>
    </Box>
  )
}
