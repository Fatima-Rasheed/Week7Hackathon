'use client';

import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

export const settingsMenu = [
  { id: 'appearance',    label: 'Appearance',          sub: 'Dark and Light mode, Font size',    icon: '/Heart.png' },
  { id: 'restaurant',   label: 'Your Restaurant',      sub: 'Name, logo, address',               icon: '/Group.png' },
  { id: 'products',     label: 'Products Management',  sub: 'Manage your product, pricing',      icon: '/Discount.png' },
  { id: 'notifications',label: 'Notifications',        sub: 'Customize your notifications',      icon: '/Notification.png' },
  { id: 'security',     label: 'Security',             sub: 'Configure Password, PIN, etc',      icon: '/Unlock.png' },
  { id: 'about',        label: 'About Us',             sub: 'Find out more about Posly',         icon: '/About Us.png' },
];

interface Props {
  activeSection: string;
  onSelect: (id: string) => void;
}

export function SettingsSidebar({ activeSection, onSelect }: Props) {
  return (
    <Box sx={{ width: '100%', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <List disablePadding sx={{ pt: 1 }}>
        {settingsMenu.map(({ id, label, sub, icon }) => {
          const isActive = activeSection === id;
          return (
            <ListItem key={id} disablePadding sx={{ mb: 2 }}>
              <ListItemButton
                onClick={() => onSelect(id)}
                sx={{
                  py: 0.75,
                  px: 3,
                  bgcolor: isActive ? 'rgba(234,124,105,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #EA7C69' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(234,124,105,0.18)' : 'rgba(255,255,255,0.04)',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <img
                    src={icon}
                    alt={label}
                    width={16}
                    height={16}
                    style={{
                      filter: isActive
                        ? 'invert(0%) sepia(60%) saturate(500%) hue-rotate(330deg) brightness(160%)'
                        : 'brightness(8)',
                      transition: 'filter 0.15s ease',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  secondary={sub}
                  slotProps={{
                    primary: {
                      style: {
                        fontWeight: 500,
                        fontSize: '0.98rem',
                        color: isActive ? '#EA7C69' : 'white',
                        lineHeight: 1.5,
                      },
                    },
                    secondary: {
                      style: {
                        fontSize: '0.65rem',
                        color: isActive ? 'rgba(234,124,105,0.55)' : 'rgba(255,255,255,0.25)',
                        marginTop: 1,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
