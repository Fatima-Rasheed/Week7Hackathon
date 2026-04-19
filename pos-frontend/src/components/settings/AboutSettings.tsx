'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export function AboutSettings() {
  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        About Us
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Information about this application.
      </Typography>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <RestaurantMenuIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Posly
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Restaurant Point of Sale System
          </Typography>
          <Chip label="v1.0.0" size="small" variant="outlined" sx={{ mb: 3 }} />

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ textAlign: 'left' }}>
            {[
              { label: 'Frontend', value: 'Next.js 15 + MUI v6' },
              { label: 'Backend', value: 'NestJS + MongoDB' },
              { label: 'State', value: 'Redux Toolkit + RTK Query' },
            ].map(({ label, value }) => (
              <Box
                key={label}
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Built for Jaegar Resto · {new Date().getFullYear()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
