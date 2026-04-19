'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Slider,
  Stack,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '@/theme/ThemeContext';
import { useState } from 'react';

export function AppearanceSettings() {
  const { mode, setMode } = useThemeMode();
  const [fontSize, setFontSize] = useState<number>(14);

  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Appearance
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Customize how the app looks and feels.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Color Theme
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Choose between dark and light mode.
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, val) => { if (val) setMode(val); }}
            sx={{ gap: 1 }}
          >
            <ToggleButton
              value="dark"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: '8px !important',
                gap: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <DarkModeIcon fontSize="small" />
              Dark
            </ToggleButton>
            <ToggleButton
              value="light"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: '8px !important',
                gap: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <LightModeIcon fontSize="small" />
              Light
            </ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Font Size
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Adjust the base font size for readability.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 24 }}>A</Typography>
            <Slider
              value={fontSize}
              min={12}
              max={18}
              step={1}
              marks={[
                { value: 12, label: '12' },
                { value: 14, label: '14' },
                { value: 16, label: '16' },
                { value: 18, label: '18' },
              ]}
              onChange={(_, val) => setFontSize(val as number)}
              sx={{ flex: 1 }}
            />
            <Typography variant="body1" sx={{ minWidth: 24, fontWeight: 700 }}>A</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Preview: <span style={{ fontSize }}>The quick brown fox jumps over the lazy dog.</span>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
