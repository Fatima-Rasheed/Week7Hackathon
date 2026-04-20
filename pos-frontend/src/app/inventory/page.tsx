'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
  RawMaterial,
} from '@/store/api/rawMaterialsApi';

interface FormState {
  name: string;
  unit: 'g' | 'ml' | 'pcs';
  currentStock: string;
  minStockAlert: string;
}

const defaultForm: FormState = {
  name: '',
  unit: 'g',
  currentStock: '',
  minStockAlert: '',
};

export default function InventoryPage() {
  const { data: materials, isLoading, isError, refetch } = useGetRawMaterialsQuery();
  const [createMaterial] = useCreateRawMaterialMutation();
  const [updateMaterial] = useUpdateRawMaterialMutation();
  const [deleteMaterial] = useDeleteRawMaterialMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (mat: RawMaterial) => {
    setEditingId(mat._id);
    setForm({
      name: mat.name,
      unit: mat.unit as 'g' | 'ml' | 'pcs',
      currentStock: String(mat.currentStock),
      minStockAlert: mat.minStockAlert != null ? String(mat.minStockAlert) : '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.currentStock) {
      setError('Name and stock are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        unit: form.unit,
        currentStock: Number(form.currentStock),
        ...(form.minStockAlert ? { minStockAlert: Number(form.minStockAlert) } : {}),
      };
      if (editingId) {
        await updateMaterial({ id: editingId, data: payload }).unwrap();
      } else {
        await createMaterial(payload).unwrap();
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      setError(err?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this raw material?')) return;
    await deleteMaterial(id);
  };

  const isLow = (mat: RawMaterial) =>
    mat.minStockAlert != null && mat.currentStock <= mat.minStockAlert;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>Inventory</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage raw materials and stock levels</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2, bgcolor: '#EA7C69', '&:hover': { bgcolor: '#d96a57' }, flexShrink: 0 }}
        >
          Add Material
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      )}
      {isError && (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>
        }>
          Failed to load inventory.
        </Alert>
      )}

      {!isLoading && !isError && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Current Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Min Alert</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials?.map((mat) => (
                    <TableRow key={mat._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{mat.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={mat.unit} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: isLow(mat) ? 'warning.main' : 'text.primary' }}
                        >
                          {mat.currentStock.toLocaleString()} {mat.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {mat.minStockAlert != null ? `${mat.minStockAlert} ${mat.unit}` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isLow(mat) ? (
                          <Chip label="Low Stock" color="warning" size="small" />
                        ) : (
                          <Chip label="In Stock" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openEdit(mat)} sx={{ mr: 0.5 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(mat._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {materials?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography sx={{ color: 'text.secondary', py: 3 }}>
                          No raw materials yet. Add some to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Raw Material' : 'Add Raw Material'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              value={form.unit}
              label="Unit"
              onChange={(e) => setForm({ ...form, unit: e.target.value as 'g' | 'ml' | 'pcs' })}
            >
              <MenuItem value="g">g (grams)</MenuItem>
              <MenuItem value="ml">ml (milliliters)</MenuItem>
              <MenuItem value="pcs">pcs (pieces)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Current Stock"
            type="number"
            fullWidth
            value={form.currentStock}
            onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Min Stock Alert (optional)"
            type="number"
            fullWidth
            value={form.minStockAlert}
            onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })}
            helperText="Alert when stock falls below this level"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
