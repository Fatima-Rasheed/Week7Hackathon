'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Box, Tooltip, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useTheme, useMediaQuery } from '@mui/material';

const navItems = [
  { icon: HomeOutlinedIcon,            label: 'POS',       path: '/' },
  { icon: SpeedOutlinedIcon,           label: 'Dashboard', path: '/dashboard' },
  { icon: PieChartOutlineOutlinedIcon, label: 'Orders',    path: '/orders' },
  { icon: ExploreOutlinedIcon,         label: 'Inventory', path: '/inventory' },
  { icon: SettingsOutlinedIcon,        label: 'Settings',  path: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const activeIndex = navItems.findIndex(
    ({ path }) => path === '/' ? pathname === '/' : pathname.startsWith(path)
  );

  if (isMobile) {
    return (
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={activeIndex === -1 ? 0 : activeIndex}
          onChange={(_, idx) => router.push(navItems[idx].path)}
          sx={{ bgcolor: '#1A1825', height: 60 }}
        >
          {navItems.map(({ icon: Icon, label }) => (
            <BottomNavigationAction
              key={label}
              label={label}
              icon={<Icon sx={{ fontSize: 22 }} />}
              sx={{
                color: 'rgba(234,124,105,0.45)',
                minWidth: 0,
                '&.Mui-selected': { color: '#EA7C69' },
                '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem' },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 80,
        bgcolor: '#1A1825',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: '24px',
        pb: '24px',
        zIndex: 1200,
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => router.push('/')}
        sx={{
          width: 52,
          height: 52,
          bgcolor: '#EA7C69',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: '32px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <StorefrontOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
      </Box>

      {/* Nav Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '45px', flex: 1 }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <Tooltip key={path} title={label} placement="right">
              <Box
                onClick={() => router.push(path)}
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  bgcolor: isActive ? '#EA7C69' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isActive ? '#fff' : '#EA7C69',
                  '&:hover': {
                    bgcolor: isActive ? '#EA7C69' : 'rgba(234,124,105,0.12)',
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Bottom preferences icon */}
      {/* <Tooltip title="Preferences" placement="right">
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(234,124,105,0.35)',
            '&:hover': { color: '#EA7C69' },
            transition: 'color 0.2s',
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 22 }} />
        </Box>
      </Tooltip> */}
    </Box>
  );
}
