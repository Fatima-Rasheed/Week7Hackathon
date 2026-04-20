'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
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
  CircularProgress,
  Alert,
  Divider,
  Autocomplete,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  Product,
} from '@/store/api/productsApi';
import { useGetRawMaterialsQuery, RawMaterial } from '@/store/api/rawMaterialsApi';

const CATEGORIES = ['Hot Dishes', 'Cold Dishes', 'Soup', 'Grill', 'Appetizer', 'Dessert'];
const TAB_CATEGORIES = ['All', 'Hot Dishes', 'Cold Dishes', 'Soup', 'Grill', 'Appetizer', 'Dessert'];

interface RecipeFormItem {
  rawMaterialId: string;
  rawMaterialName: string;
  unit: string;
  quantityRequired: string;
}

interface ProductForm {
  name: string;
  category: string;
  price: string;
  image: string;
  imageFile: File | null;
  imagePreview: string;
  recipe: RecipeFormItem[];
}

const defaultForm: ProductForm = {
  name: '',
  category: 'Hot Dishes',
  price: '',
  image: '',
  imageFile: null,
  imagePreview: '',
  recipe: [],
};

export function ProductsManagement() {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const { data: rawMaterials } = useGetRawMaterialsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [activeCategory, setActiveCategory] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filtered = products?.filter((p) => activeCategory === 'All' ? true : p.category === activeCategory) ?? [];

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, category: activeCategory === 'All' ? 'Hot Dishes' : activeCategory });
    setImageMode('url');
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image || '',
      imageFile: null,
      imagePreview: product.image || '',
      recipe: product.recipe.map((r) => {
        const mat = rawMaterials?.find((m) => m._id === r.rawMaterialId);
        return {
          rawMaterialId: r.rawMaterialId,
          rawMaterialName: mat?.name ?? r.rawMaterialId,
          unit: mat?.unit ?? '',
          quantityRequired: String(r.quantityRequired),
        };
      }),
    });
    setImageMode(product.image?.startsWith('data:') ? 'file' : 'url');
    setError('');
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setForm((f) => ({ ...f, imageFile: file, imagePreview: dataUrl, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setForm((f) => ({ ...f, imageFile: null, imagePreview: '', image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchImageMode = (mode: 'url' | 'file') => {
    setImageMode(mode);
    clearImage();
  };

  const addRecipeItem = () => {
    setForm((f) => ({
      ...f,
      recipe: [...f.recipe, { rawMaterialId: '', rawMaterialName: '', unit: '', quantityRequired: '' }],
    }));
  };

  const removeRecipeItem = (idx: number) => {
    setForm((f) => ({ ...f, recipe: f.recipe.filter((_, i) => i !== idx) }));
  };

  const selectMaterial = (idx: number, mat: RawMaterial | null) => {
    if (!mat) return;
    setForm((f) => {
      const recipe = [...f.recipe];
      recipe[idx] = { ...recipe[idx], rawMaterialId: mat._id, rawMaterialName: mat.name, unit: mat.unit };
      return { ...f, recipe };
    });
  };

  const updateRecipeQty = (idx: number, value: string) => {
    setForm((f) => {
      const recipe = [...f.recipe];
      recipe[idx] = { ...recipe[idx], quantityRequired: value };
      return { ...f, recipe };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    const invalidRecipe = form.recipe.some((r) => !r.rawMaterialId || !r.quantityRequired || Number(r.quantityRequired) <= 0);
    if (invalidRecipe) { setError('All recipe items must have a material and quantity > 0'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        image: form.image || undefined,
        recipe: form.recipe.map((r) => ({ rawMaterialId: r.rawMaterialId, quantityRequired: Number(r.quantityRequired) })),
      };
      if (editingId) {
        await updateProduct({ id: editingId, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      setDialogOpen(false);
    } catch (e: unknown) {
      console.error('Save product error:', e);
      const err = e as { data?: { message?: string | string[] }; status?: number };
      const msg = Array.isArray(err?.data?.message)
        ? err.data!.message!.join(', ')
        : err?.data?.message || `Save failed (status: ${err?.status ?? 'unknown'})`;
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
  };

  const previewSrc = form.imagePreview || (imageMode === 'url' ? form.image : '');

  return (
    <Box sx={{ p: 3, maxWidth: 860, mx: 'auto' }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#fff',
            }}
          >
            Products Management
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {filtered.length} items in {activeCategory}
          </Typography>
        </Box>
      <Button
  variant="outlined"
  size="small"
  startIcon={
    <Box
      component="img"
      src="/Option.png" // 🔗 your image URL
      alt="icon"
      sx={{ width: 16, height: 16 }}
    />
  }
  sx={{
    borderRadius: '10px',
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: '0.75rem',
    px: 4,
    py: 2,
    '&:hover': {
      borderColor: 'primary.main',
      color: 'primary.main',
      bgcolor: 'rgba(232,89,60,0.06)',
    },
    transition: 'all 0.2s',
  }}
>
  Manage Categories
</Button>
  </Box>
      {/* ── Category Tabs ── */}
      <Box
        sx={{
          mb: 3,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          '& .MuiTabs-root': { minHeight: 40 },
          '& .MuiTab-root': {
            minHeight: 40,
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#fff',
            textTransform: 'none',
            px: 2,
            '&:hover': { color: '#EA7C69' },
            '&.Mui-selected': { color: '#fff' },
          },
          '& .MuiTabs-indicator': {
            bgcolor: 'primary.main',
            height: 2,
            borderRadius: '2px 2px 0 0',
          },
        }}
      >
        <Tabs
          value={activeCategory}
          onChange={(_, v) => setActiveCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TAB_CATEGORIES.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>
      </Box>

      {isLoading && <CircularProgress color="primary" />}
      {isError && <Alert severity="error">Failed to load products.</Alert>}

      {!isLoading && !isError && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}>
          {/* ── Add new dish card ── */}
          <Card
            onClick={openCreate}
            sx={{
              cursor: 'pointer',
              minHeight: { xs: 200, sm: 299 },
              border: '1.5px dashed rgba(234,124,105,0.45)',
              bgcolor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              boxShadow: 'none',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              '&:hover': {
                border: '1.5px dashed rgba(234,124,105,0.8)',
                bgcolor: 'rgba(234,124,105,0.05)',
                transform: 'translateY(-3px)',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1.5 }} />
            <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.9rem' }}>
              Add new dish
            </Typography>
          </Card>

          {/* ── Product cards ── */}
          {filtered.map((product) => (
            <Card
              key={product._id}
              onMouseEnter={() => setHoveredCard(product._id)}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                minHeight: { xs: 200, sm: 299 },
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: '#1F1D2B',
                border: '1px solid',
                borderColor: hoveredCard === product._id ? 'rgba(234,124,105,0.35)' : 'rgba(255,255,255,0.06)',
                boxShadow: hoveredCard === product._id ? '0 12px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform: hoveredCard === product._id ? 'translateY(-4px)' : 'none',
              }}
            >
                {/* Circular image */}
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3, pb: 1.5 }}>
                  <Box
                    component="img"
                    src={product.image || 'https://via.placeholder.com/140?text=No+Image'}
                    alt={product.name}
                    sx={{
                      width: 130,
                      height: 130,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      transform: hoveredCard === product._id ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/140?text=No+Image'; }}
                  />
                </Box>

                {/* Name + price/stock */}
                <CardContent sx={{ flex: 1, px: 2, pt: 0, pb: 1, textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#fff',
                      lineHeight: 1.35,
                      mb: 1,
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                    ${product.price.toFixed(2)}&nbsp;&nbsp;•&nbsp;&nbsp;{product.recipe.length} items
                  </Typography>
                </CardContent>

                {/* Edit & Delete footer */}
                <Box sx={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box
                    onClick={() => openEdit(product)}
                    sx={{
                      flex: 1,
                      bgcolor: 'rgba(234,124,105,0.15)',
                      py: 1.4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: 'rgba(234,124,105,0.25)' },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'primary.main' }}>
                      Edit dish
                    </Typography>
                  </Box>
                  <Tooltip title="Delete Dish">
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product._id);
                      }}
                      sx={{
                        px: 2.5,
                        bgcolor: 'rgba(255,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        borderLeft: '1px solid rgba(255,255,255,0.06)',
                        '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18, color: '#ff4d4d' }} />
                    </Box>
                  </Tooltip>
                </Box>
              </Card>
          ))}

          {filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8, gridColumn: '1 / -1' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>
                No dishes in this category yet
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Add/Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#1F1D2B',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 3,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3, py: 2,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>
              {editingId ? 'Edit Dish' : 'Add New Dish'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mt: 0.2 }}>
              {activeCategory}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{
              color: 'text.disabled',
              borderRadius: '8px',
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: 0 }}>
              <TextField label="Dish Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 8px)' }, minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 8px)' }, minWidth: 100 }}>
              <TextField label="Price ($)" type="number" fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Box>

            {/* Image */}
            <Box sx={{ flex: '1 1 100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Dish Image
                </Typography>
                <Tooltip title="Paste image URL">
                  <IconButton size="small" onClick={() => switchImageMode('url')} sx={{ borderRadius: 1, border: '1px solid', borderColor: imageMode === 'url' ? 'primary.main' : 'divider', color: imageMode === 'url' ? 'primary.main' : 'text.secondary' }}>
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Upload from computer">
                  <IconButton size="small" onClick={() => switchImageMode('file')} sx={{ borderRadius: 1, border: '1px solid', borderColor: imageMode === 'file' ? 'primary.main' : 'divider', color: imageMode === 'file' ? 'primary.main' : 'text.secondary' }}>
                    <UploadFileIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {imageMode === 'url' ? (
                <TextField label="Image URL (optional)" fullWidth value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value, imagePreview: '' })} placeholder="https://..." />
              ) : (
                <Box>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '1.5px dashed', borderColor: previewSrc ? 'primary.main' : 'rgba(255,255,255,0.1)',
                      borderRadius: 2, p: 2, textAlign: 'center', cursor: 'pointer',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(232,89,60,0.04)' },
                      transition: 'all 0.2s', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    }}
                  >
                    {previewSrc ? (
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>{form.imageFile?.name ?? 'Image selected'} — click to change</Typography>
                    ) : (
                      <>
                        <UploadFileIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Click to browse — JPG, PNG, WEBP</Typography>
                      </>
                    )}
                  </Box>
                </Box>
              )}

              {previewSrc && (
                <Box sx={{ mt: 1.5, position: 'relative', display: 'inline-block' }}>
                  <Box component="img" src={previewSrc} alt="Preview" sx={{ height: 90, borderRadius: 2, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <IconButton size="small" onClick={clearImage} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', width: 20, height: 20, '&:hover': { bgcolor: 'error.dark' } }}>
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.06)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '-0.2px' }}>Recipe / Ingredients</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addRecipeItem} sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'primary.main' }}>
              Add Ingredient
            </Button>
          </Box>

          {form.recipe.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
              <Autocomplete
                options={rawMaterials ?? []} getOptionLabel={(opt) => opt.name}
                value={rawMaterials?.find((m) => m._id === item.rawMaterialId) ?? null}
                onChange={(_, val) => selectMaterial(idx, val)}
                renderInput={(params) => <TextField {...params} label="Raw Material" size="small" />}
                sx={{ flex: 2 }} isOptionEqualToValue={(opt, val) => opt._id === val._id}
              />
              <TextField label={`Qty (${item.unit || 'unit'})`} type="number" size="small" value={item.quantityRequired} onChange={(e) => updateRecipeQty(idx, e.target.value)} sx={{ flex: 1 }} />
              <IconButton size="small" onClick={() => removeRecipeItem(idx)} sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.5, '&:hover': { color: 'error.main' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {form.recipe.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 2, fontSize: '0.8rem' }}>
              No ingredients added. Click &quot;Add Ingredient&quot; to build the recipe.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button
            variant="outlined"
            onClick={() => setDialogOpen(false)}
            sx={{
              borderRadius: '8px',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.8rem',
              '&:hover': { borderColor: 'rgba(255,255,255,0.25)', color: '#fff', bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 3,
              background: 'linear-gradient(135deg, #e8593c, #c94422)',
              boxShadow: '0 4px 16px rgba(232,89,60,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #f0613e, #d4492a)', boxShadow: '0 6px 20px rgba(232,89,60,0.45)' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            {saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}