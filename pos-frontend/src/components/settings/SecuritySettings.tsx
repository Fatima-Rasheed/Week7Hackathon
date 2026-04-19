'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import PinIcon from '@mui/icons-material/Pin';

export function SecuritySettings() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const handleChangePassword = () => {
    setPwError('');
    setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('All fields are required.');
      return;
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }
    // In a real app this would call an API
    setPwSuccess(true);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const handleSetPin = () => {
    setPinError('');
    setPinSuccess(false);
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError('PIN must be 4–6 digits.');
      return;
    }
    // In a real app this would call an API
    setPinSuccess(true);
    setPin('');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Security
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Manage your password and PIN settings.
      </Typography>

      {/* Change Password */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockResetIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Change Password
            </Typography>
          </Box>

          {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
          {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password updated successfully.</Alert>}

          <TextField
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            fullWidth
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent((v) => !v)} edge="end" size="small">
                      {showCurrent ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="New Password"
            type={showNew ? 'text' : 'password'}
            fullWidth
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((v) => !v)} edge="end" size="small">
                      {showNew ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            fullWidth
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
                      {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button variant="contained" onClick={handleChangePassword} sx={{ borderRadius: 2 }}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* PIN */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PinIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Quick Access PIN
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Set a 4–6 digit PIN for quick login.
          </Typography>

          {pinError && <Alert severity="error" sx={{ mb: 2 }}>{pinError}</Alert>}
          {pinSuccess && <Alert severity="success" sx={{ mb: 2 }}>PIN updated successfully.</Alert>}

          <Divider sx={{ mb: 2 }} />
          <TextField
            label="New PIN"
            type="password"
            slotProps={{ htmlInput: { maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' } }}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            sx={{ mb: 2, width: 180 }}
          />
          <Box>
            <Button variant="contained" onClick={handleSetPin} sx={{ borderRadius: 2 }}>
              Set PIN
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
