'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useGetProductsAvailabilityQuery } from '@/store/api/productsApi';
import { ProductCard } from '@/components/pos/ProductCard';
import { OrderPanel } from '@/components/pos/OrderPanel';
import { useSelector, useDispatch } from 'react-redux';
import { selectOrderType, setOrderType } from '@/store/slices/cartSlice';

const CATEGORIES = ['All', 'Hot Dishes', 'Cold Dishes', 'Soup', 'Grill', 'Appetizer', 'Dessert'];

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const orderType = useSelector(selectOrderType);
  const dispatch = useDispatch();

  const { data: products, isLoading, isError, refetch } = useGetProductsAvailabilityQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const filtered = products?.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }) ?? [];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Box sx={{ display: 'flex', height: { xs: 'auto', md: '100vh' }, overflow: { md: 'hidden' }, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left: Product Selection */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 3 }, overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Jaegar Resto</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{today}</Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search for food, coffee, etc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.primary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: 270 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2D303E',
                height:48,
     
              },
            }}
          />
        </Box>

        {/* Category Tabs */}
        <Tabs
          value={activeCategory}
          onChange={(_, v) => setActiveCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            '& .MuiTabs-indicator': {
              backgroundColor: '#EA7C69',
              height: '2px',
            },
          }}
        >
          {CATEGORIES.map((cat) => (
            <Tab
              key={cat}
              label={cat}
              value={cat}
              sx={{
                textTransform: 'none',
                fontSize: '0.9rem',
                minHeight: 40,
                px: 2,
                color: 'white',
                fontWeight: 500,
                '&:hover': {
                  color: '#EA7C69',
                },
                '&.Mui-selected': {
                  color: '#EA7C69',
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </Tabs>

        {/* Order type dropdown + section header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Choose Dishes</Typography>
          <Button
            variant="contained"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: '#1F1D2B',
              color: 'white',
              borderRadius: '6px',
              textTransform: 'none',
           
              fontWeight: 500,
              px: 2.5,
              '&:hover': { bgcolor: '#393C49' },
            }}
          >
            {orderType}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: '#2D303E',
                  border: '1px solid #393C49',
                  borderRadius: '8px',
                  mt: 0.5,
                },
              },
            }}
          >
            {(['Dine In', 'To Go', 'Delivery'] as const).map((type) => (
              <MenuItem
                key={type}
                selected={orderType === type}
                onClick={() => { dispatch(setOrderType(type)); setAnchorEl(null); }}
                sx={{
                  color: orderType === type ? '#EA7C69' : 'white',
                  fontSize: '0.875rem',
                  '&:hover': { bgcolor: 'rgba(234,124,105,0.1)', color: '#EA7C69' },
                  '&.Mui-selected': { bgcolor: 'rgba(234,124,105,0.15)' },
                }}
              >
                {type}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Products Grid */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          {isError && (
            <Alert severity="error" action={
              <Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>
            }>
              Failed to load products. Is the backend running?
            </Alert>
          )}
          {!isLoading && !isError && (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(180px, 1fr))', md: 'repeat(auto-fill, minmax(200px, 1fr))', lg: 'repeat(auto-fill, minmax(220px, 1fr))' },
              gap: { xs: 2, sm: 3 },
              pt: `${150 / 2 / 8}px`,
              px: 1,
            }}>
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
              {filtered.length === 0 && (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', gridColumn: '1 / -1', py: 4 }}>
                  No dishes found in this category.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Right: Order Panel */}
      <OrderPanel />
    </Box>
  );
}
