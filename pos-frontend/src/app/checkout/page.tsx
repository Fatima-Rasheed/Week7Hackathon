'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  selectOrderType,
  selectDiscount,
  clearCart,
  setOrderType,
  updateNote,
} from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';

type PaymentMethod = 'Credit Card' | 'PayPal' | 'Cash';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const orderType = useSelector(selectOrderType);
  const discount = useSelector(selectDiscount);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expDateError, setExpDateError] = useState('');
  const [cvv, setCvv] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState(0);

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const subTotal = total - discount;

  const handleConfirm = async () => {
    setError('');
    if (items.length === 0) {
      setError('Cart is empty');
      return;
    }

    if (paymentMethod === 'Credit Card') {
      const digitsOnly = cardNumber.replace(/\s/g, '');
      if (digitsOnly.length !== 16 || !/^\d{16}$/.test(digitsOnly)) {
        setCardNumberError('Card number must be exactly 16 digits');
        return;
      }
      const expMatch = expDate.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
      if (!expMatch) { setExpDateError('Use MM/YYYY format'); return; }
      const expMonth = parseInt(expMatch[1], 10);
      const expYear = parseInt(expMatch[2], 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setExpDateError('Card is expired'); return;
      }
      setExpDateError('');
    }

    try {
      await createOrder({
        type: orderType,
        tableNo: tableNo || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          priceAtSale: i.price,
          note: i.note,
        })),
        discount,
        subTotal,
        paymentMethod,
        customerName: customerName || undefined,
      }).unwrap();

      setConfirmedOrderTotal(subTotal);
      dispatch(clearCart());
      setOrderSuccess(true);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e?.data?.message || 'Order failed. Please check stock availability.');
    }
  };

  const paymentOptions: { value: PaymentMethod; label: string; img: string }[] = [
    { value: 'Credit Card', label: 'Credit Card', img: '/Subtract.png' },
    
    { value: 'PayPal', label: 'Paypal', img: '/Option.png' },
    { value: 'Cash', label: 'Cash', img: '/Wallet.png' },
  ];

  // Success screen
  if (orderSuccess) {
    return (
      <Box
      
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 3,
          p: 4,
          textAlign: 'center',
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 360 }}>
          Your order has been placed and is now being prepared.
          {customerName ? ` Thank you, ${customerName}!` : ''}
        </Typography>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            minWidth: 280,
            border: '1px solid',
            borderColor: 'success.main',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Amount Paid
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
            ${confirmedOrderTotal.toFixed(2)}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Payment via {paymentMethod}
          </Typography>
          {orderType === 'Dine In' && tableNo && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Table {tableNo}
            </Typography>
          )}
        </Paper>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/orders')}
            sx={{ borderRadius: 2 }}
          >
            View Orders
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/')}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            New Order
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '100vh', overflow: { md: 'hidden' } }}>
      {/* Left: Order Confirmation */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          overflow: 'auto',
          borderRight: { md: '1px solid' },
          borderBottom: { xs: '1px solid', md: 'none' },
          borderColor: 'divider',
          maxHeight: { md: '100vh' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Confirmation</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Review your order</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: 2,
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Order Items */}
        {items.map((item) => (
          <Paper
            key={item.productId}
            sx={{ p: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.03)' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={item.image || 'https://via.placeholder.com/48'}
                alt={item.productName}
                sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.productName.length > 22
                    ? item.productName.slice(0, 22) + '...'
                    : item.productName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ${item.price.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.quantity}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
            {/* Note input per item */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <TextField
                size="small"
                placeholder="Order Note..."
                value={item.note}
                onChange={(e) =>
                  dispatch(updateNote({ productId: item.productId, note: e.target.value }))
                }
                fullWidth
                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.75 } }}
              />
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  p: 0.75,
                  flexShrink: 0,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Paper>
        ))}

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ color: 'text.secondary' }}>Discount</Typography>
          <Typography>${discount.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 600 }}>Sub total</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ${subTotal.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Right: Payment */}
      <Box sx={{ width: { xs: '100%', md: 380 }, p: { xs: 2, sm: 3 }, overflow: 'auto', maxHeight: { md: '100vh' } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Payment</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          3 payment method available
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Payment Method */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>Payment Method</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {paymentOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={paymentMethod === opt.value ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod(opt.value)}
              sx={{
                flex: 1,
                flexDirection: 'column',
                py: 1.5,
                gap: 0.5,
                fontSize: '0.7rem',
              }}
            >
              <Box
                component="img"
                src={opt.img}
                alt={opt.label}
                sx={{
                  width: 28,
                  height: 28,
                  objectFit: 'contain',
                  filter: paymentMethod === opt.value ? 'none' : 'brightness(0) invert(1)',
                }}
              />
              {opt.label}
            </Button>
          ))}
        </Box>

        {/* Card fields (only for Credit Card) */}
        {paymentMethod === 'Credit Card' && (
          <>
            <TextField
              label="Cardholder Name"
              fullWidth
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Card Number"
              fullWidth
              value={cardNumber}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                setCardNumber(formatted);
                setCardNumberError(raw.length > 0 && raw.length < 16 ? 'Card number must be 16 digits' : '');
              }}
              placeholder="0000 0000 0000 0000"
              error={!!cardNumberError}
              helperText={cardNumberError}
              slotProps={{ htmlInput: { maxLength: 19 } }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Expiration Date"
                value={expDate}
                onChange={(e) => {
                  setExpDateError('');
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
                  const formatted = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
                  setExpDate(formatted);
                }}
                placeholder="MM/YYYY"
                error={!!expDateError}
                helperText={expDateError}
                slotProps={{ htmlInput: { maxLength: 7 } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                type="password"
                sx={{ flex: 1 }}
              />
            </Box>
          </>
        )}

        {/* Customer name */}
        <TextField
          label="Customer Name (optional)"
          fullWidth
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Order Type + Table */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Order Type</InputLabel>
            <Select
              value={orderType}
              label="Order Type"
              onChange={(e) => dispatch(setOrderType(e.target.value as 'Dine In' | 'To Go' | 'Delivery'))}
            >
              <MenuItem value="Dine In">Dine In</MenuItem>
              <MenuItem value="To Go">To Go</MenuItem>
              <MenuItem value="Delivery">Delivery</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Table no."
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => router.back()}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleConfirm}
            disabled={isLoading || items.length === 0}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Payment'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}