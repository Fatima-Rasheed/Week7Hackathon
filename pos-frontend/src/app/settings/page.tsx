'use client';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectActiveSection } from '@/store/slices/settingsSlice';
import { ProductsManagement } from '@/components/settings/ProductsManagement';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { AboutSettings } from '@/components/settings/AboutSettings';
import { RestaurantSettings } from '@/components/settings/RestaurantSettings';

export default function SettingsPage() {
  const activeSection = useSelector(selectActiveSection);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#252836', p: { xs: 2, sm: '28px' }, pt: { xs: 2, sm: '32px' } }}>
      <Box sx={{ height: { xs: 0, md: '54px' } }} />
      <Box
        sx={{
          bgcolor: '#1F1D2B',
          borderRadius: '8px',
          minHeight: { xs: 'auto', md: 723 },
          overflow: 'auto',
        }}
      >
        {activeSection === 'products' && <ProductsManagement />}
        {activeSection === 'appearance' && <AppearanceSettings />}
        {activeSection === 'restaurant' && <RestaurantSettings />}
        {activeSection === 'notifications' && <NotificationsSettings />}
        {activeSection === 'security' && <SecuritySettings />}
        {activeSection === 'about' && <AboutSettings />}
      </Box>
    </Box>
  );
}
