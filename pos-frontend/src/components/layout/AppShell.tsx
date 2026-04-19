'use client';

import { ReactNode, useState } from 'react';
import { Box, Typography, Drawer, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar } from './Sidebar';
import { SettingsSidebar } from './SettingsSidebar';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveSection, setActiveSection } from '@/store/slices/settingsSlice';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSettings = pathname.startsWith('/settings');
  const isCheckout = pathname.startsWith('/checkout');
  const activeSection = useSelector(selectActiveSection);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  if (isCheckout) {
    return <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>{children}</Box>;
  }

  const settingsSidebarContent = (
    <Box
      sx={{
        width: 260,
        bgcolor: '#1F1D2B',
        display: 'flex',
        flexDirection: 'column',
        pt: '28px',
        px: '12px',
        pb: '16px',
        height: '100%',
      }}
    >
      <SettingsSidebar
        activeSection={activeSection}
        onSelect={(id) => {
          dispatch(setActiveSection(id));
          if (isMobile) setSettingsDrawerOpen(false);
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />

      {/* Desktop settings sub-sidebar */}
      {isSettings && !isMobile && (
        <Box
          sx={{
            position: 'fixed',
            left: 96,
            top: 32,
            width: 260,
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: '1.375rem', color: '#fff', mb: '12px', ml: '4px' }}
          >
            Settings
          </Typography>
          <Box
            sx={{
              bgcolor: '#1F1D2B',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              pt: '28px',
              px: '12px',
              pb: '16px',
              overflow: 'hidden',
            }}
          >
            <SettingsSidebar
              activeSection={activeSection}
              onSelect={(id) => dispatch(setActiveSection(id))}
            />
          </Box>
        </Box>
      )}

      {/* Mobile settings drawer */}
      {isSettings && isMobile && (
        <Drawer
          anchor="left"
          open={settingsDrawerOpen}
          onClose={() => setSettingsDrawerOpen(false)}
          slotProps={{ paper: { sx: { bgcolor: '#1F1D2B' } } }}
        >
          {settingsSidebarContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: isSettings ? `${80 + 260 + 20}px` : '80px' },
          mb: { xs: '60px', md: 0 }, // space for mobile bottom nav
          minHeight: '100vh',
          overflow: 'auto',
          transition: 'margin-left 0.2s ease',
        }}
      >
        {/* Mobile settings header with menu toggle */}
        {isSettings && isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <IconButton onClick={() => setSettingsDrawerOpen(true)} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Settings</Typography>
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}
