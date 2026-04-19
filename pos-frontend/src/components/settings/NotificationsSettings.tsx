'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';

interface NotifSetting {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const notifSettings: NotifSetting[] = [
  {
    id: 'new_order',
    label: 'New Order',
    description: 'Get notified when a new order is placed.',
    defaultOn: true,
  },
  {
    id: 'low_stock',
    label: 'Low Stock Alert',
    description: 'Alert when a raw material falls below its minimum threshold.',
    defaultOn: true,
  },
  {
    id: 'order_complete',
    label: 'Order Completed',
    description: 'Notify when an order status changes to Completed.',
    defaultOn: false,
  },
  {
    id: 'daily_summary',
    label: 'Daily Summary',
    description: 'Receive a daily revenue and order summary.',
    defaultOn: false,
  },
  {
    id: 'sound',
    label: 'Sound Alerts',
    description: 'Play a sound when notifications arrive.',
    defaultOn: true,
  },
];

export function NotificationsSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(notifSettings.map((s) => [s.id, s.defaultOn])),
  );

  const toggle = (id: string) =>
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Notifications
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Choose which events trigger notifications.
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {notifSettings.map((s, idx) => (
            <Box key={s.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2,
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {s.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {s.description}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings[s.id]}
                      onChange={() => toggle(s.id)}
                      color="primary"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
              {idx < notifSettings.length - 1 && <Divider />}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
