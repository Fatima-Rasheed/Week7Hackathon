'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Drawer,
  Badge,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaypalIcon from '@mui/icons-material/AccountBalanceWallet';
import CashIcon from '@mui/icons-material/Money';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  selectOrderType,
  selectDiscount,
  removeFromCart,
  updateNote,
  clearCart,
  setOrderType,
  incrementItem,
  decrementItem,
} from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';

type PaymentMethod = 'Credit Card' | 'PayPal' | 'Cash';

function generateOrderNumber(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function OrderPanel() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const orderType = useSelector(selectOrderType);
  const discount = useSelector(selectDiscount);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  // Payment form state
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

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [orderNumber, setOrderNumber] = useState('-----');
  useEffect(() => { setOrderNumber(generateOrderNumber()); }, []);
  const subTotal = total - discount;

  const handleConfirm = async () => {
    setError('');
    if (items.length === 0) { setError('Cart is empty'); return; }
    if (paymentMethod === 'Credit Card') {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length !== 16) { setCardNumberError('Card number must be 16 digits'); return; }
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
      setConfirmedTotal(subTotal);
      dispatch(clearCart());
      setShowPayment(false);
      setOrderSuccess(true);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e?.data?.message || 'Order failed. Please check stock availability.');
    }
  };

  const paymentOptions: { value: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { value: 'Credit Card', icon: <CreditCardIcon />, label: 'Credit Card' },
    { value: 'PayPal', icon: <PaypalIcon />, label: 'Paypal' },
    { value: 'Cash', icon: <CashIcon />, label: 'Cash' },
  ];

  // Success screen
  const successContent = (
    <Box sx={{ width: isMobile ? '100vw' : 400, bgcolor: '#1F1D2B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 3, p: 4, textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>Payment Successful!</Typography>
      <Typography sx={{ color: '#ABBBC2' }}>Your order has been placed.{customerName ? ` Thank you, ${customerName}!` : ''}</Typography>
      <Paper sx={{ p: 3, borderRadius: 3, minWidth: 240, border: '1px solid', borderColor: 'success.main', bgcolor: '#2D303E' }}>
        <Typography variant="body2" sx={{ color: '#ABBBC2', mb: 0.5 }}>Amount Paid</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>${confirmedTotal.toFixed(2)}</Typography>
        <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
        <Typography variant="body2" sx={{ color: '#ABBBC2' }}>via {paymentMethod}</Typography>
      </Paper>
      <Button variant="contained" onClick={() => setOrderSuccess(false)} sx={{ bgcolor: '#EA7C69', '&:hover': { bgcolor: '#d96a57' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
        New Order
      </Button>
    </Box>
  );

  const orderPanelContent = (
    <Box sx={{ width: isMobile ? '100vw' : 400, bgcolor: '#1F1D2B', display: 'flex', flexDirection: 'column', height: '100vh', boxShadow: '-4px 0 16px rgba(0,0,0,0.2)' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        {showPayment ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => setShowPayment(false)} size="small" sx={{ color: 'white', p: 0.5 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>Confirmation</Typography>
            </Box>
            <IconButton sx={{ bgcolor: '#EA7C69', color: 'white', borderRadius: '10px', width: 40, height: 40, '&:hover': { bgcolor: '#d96a57' } }}>
              <AddIcon />
            </IconButton>
          </Box>
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>Orders #{orderNumber}</Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['Dine In', 'To Go', 'Delivery'] as const).map((type) => (
            <Button key={type} variant={orderType === type ? 'contained' : 'outlined'} size="small"
              onClick={() => dispatch(setOrderType(type))}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 2, fontSize: '12px', color: orderType === type ? 'white' : '#EA7C69', borderColor: '#EA7C69', bgcolor: orderType === type ? '#EA7C69' : 'transparent', '&:hover': { bgcolor: orderType === type ? '#d96a57' : 'rgba(234,124,105,0.1)' } }}>
              {type}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Column Titles */}
      <Box sx={{ px: 3, display: 'flex', color: '#ABBBC2', fontSize: '14px', fontWeight: 500, mb: 2 }}>
        <Typography sx={{ flex: 1 }}>Item</Typography>
        <Typography sx={{ width: 40, textAlign: 'center' }}>Qty</Typography>
        <Typography sx={{ width: 60, textAlign: 'right' }}>Price</Typography>
      </Box>
      <Divider sx={{ mx: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Items List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography sx={{ color: '#ABBBC2' }}>Your cart is empty</Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box key={item.productId} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Box component="img" src={item.image || 'https://placehold.co/44x44?text=Dish'} alt={item.productName}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/44x44?text=Dish'; }}
                  sx={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover', flexShrink: 0, mr: 1.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>{item.productName}</Typography>
                  <Typography sx={{ color: '#ABBBC2', fontSize: '12px' }}>$ {item.price.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mx: 1, border: '1px solid #393C49', borderRadius: '8px', overflow: 'hidden', bgcolor: '#2D303E' }}>
                  <IconButton size="small" onClick={() => dispatch(decrementItem(item.productId))}
                    sx={{ color: '#EA7C69', borderRadius: 0, px: 0.5, '&:hover': { bgcolor: 'rgba(234,124,105,0.15)' } }}>
                    <Box sx={{ fontSize: 18, lineHeight: 1, fontWeight: 700 }}>−</Box>
                  </IconButton>
                  <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '14px', minWidth: 24, textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton size="small" onClick={() => dispatch(incrementItem(item.productId))}
                    disabled={item.quantity >= item.availableQty}
                    sx={{ color: '#EA7C69', borderRadius: 0, px: 0.5, '&:hover': { bgcolor: 'rgba(234,124,105,0.15)' }, '&.Mui-disabled': { color: '#555' } }}>
                    <Box sx={{ fontSize: 18, lineHeight: 1, fontWeight: 700 }}>+</Box>
                  </IconButton>
                </Box>
                <Typography sx={{ width: 60, textAlign: 'right', pt: 1.5, color: 'white', fontWeight: 500 }}>
                  $ {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth placeholder="Order Note..." variant="outlined" size="small" value={item.note || ''}
                  onChange={(e) => dispatch(updateNote({ productId: item.productId, note: e.target.value }))}
                  sx={{ bgcolor: '#2D303E', borderRadius: '8px', '& .MuiOutlinedInput-root': { height: '48px', color: '#E0E6E9', '& fieldset': { borderColor: '#393C49' } } }} />
                <IconButton onClick={() => dispatch(removeFromCart(item.productId))}
                  sx={{ width: 48, height: 48, border: '1px solid #FF7CA3', borderRadius: '8px', color: '#FF7CA3' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ color: '#ABBBC2' }}>Total</Typography>
          <Typography sx={{ color: 'white', fontWeight: 500 }}>$ {total.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ color: '#ABBBC2' }}>Discount</Typography>
          <Typography sx={{ color: '#EA7C69', fontWeight: 500 }}>- $ {discount.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ color: '#ABBBC2' }}>Sub total</Typography>
          <Typography sx={{ color: 'white', fontWeight: 500, fontSize: '18px' }}>$ {subTotal.toFixed(2)}</Typography>
        </Box>
        <Button fullWidth variant="contained" disabled={items.length === 0} onClick={() => setShowPayment(true)}
          sx={{ bgcolor: '#EA7C69', color: 'white', py: 1.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: '0 8px 24px rgba(234,124,105,0.3)', '&:hover': { bgcolor: '#d96a57' } }}>
          Continue to Payment
        </Button>
      </Box>
    </Box>
  );

  // Reusable styled input sx
  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#2D303E', borderRadius: '8px' },
    '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#393C49' }, '&:hover fieldset': { borderColor: '#EA7C69' } },
    '& .MuiInputBase-input::placeholder': { color: '#ABBBC2', opacity: 1 },
  };

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, mb: 0.5, display: 'block' }}>
      {children}
    </Typography>
  );

  const paymentPanelContent = (
    <Box sx={{ width: isMobile ? '100vw' : 380, bgcolor: '#1F1D2B', display: 'flex', flexDirection: 'column', height: '100vh', p: 3, overflow: 'hidden', boxShadow: '-4px 0 16px rgba(0,0,0,0.2)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>Payment</Typography>
      <Typography variant="body2" sx={{ color: '#ABBBC2', mb: 2 }}>3 payment method available</Typography>

      {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>{error}</Alert>}

      <FieldLabel>Payment Method</FieldLabel>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {paymentOptions.map((opt) => (
          <Box key={opt.value} onClick={() => setPaymentMethod(opt.value)}
            sx={{ flex: 1, position: 'relative', cursor: 'pointer', border: '1px solid', borderColor: paymentMethod === opt.value ? '#EA7C69' : '#393C49', borderRadius: '8px', py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, bgcolor: 'transparent', transition: 'border-color 0.2s', '&:hover': { borderColor: '#EA7C69' } }}>
            {paymentMethod === opt.value && (
              <Box sx={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', bgcolor: '#EA7C69', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
              </Box>
            )}
            <Box sx={{ color: '#ABBBC2' }}>{opt.icon}</Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#ABBBC2' }}>{opt.label}</Typography>
          </Box>
        ))}
      </Box>

      {paymentMethod === 'Credit Card' && (
        <>
          <FieldLabel>Cardholder Name</FieldLabel>
          <TextField fullWidth value={cardholderName} onChange={(e) => setCardholderName(e.target.value)}
            placeholder="e.g. John Doe" size="small" sx={{ mb: 1.5, ...inputSx }} />

          <FieldLabel>Card Number</FieldLabel>
          <TextField fullWidth value={cardNumber} placeholder="2584 1421 0897 1244"
            error={!!cardNumberError} helperText={cardNumberError} slotProps={{ htmlInput: { maxLength: 19 } }} size="small"
            onChange={(e) => { const raw = e.target.value.replace(/\D/g, '').slice(0, 16); setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim()); setCardNumberError(raw.length > 0 && raw.length < 16 ? 'Must be 16 digits' : ''); }}
            sx={{ mb: 1.5, ...inputSx }} />

          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel>Expiration Date</FieldLabel>
              <TextField fullWidth value={expDate}
                onChange={(e) => {
                  setExpDateError('');
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
                  const formatted = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
                  setExpDate(formatted);
                }}
                placeholder="MM/YYYY" size="small"
                error={!!expDateError} helperText={expDateError}
                slotProps={{ htmlInput: { maxLength: 7 } }}
                sx={inputSx} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel>CVV</FieldLabel>
              <TextField fullWidth value={cvv} onChange={(e) => setCvv(e.target.value)} type="password" placeholder="•••" size="small" sx={inputSx} />
            </Box>
          </Box>
        </>
      )}

      <FieldLabel>Customer Name</FieldLabel>
      <TextField fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)}
        placeholder="e.g. Levi Ackerman" size="small" sx={{ mb: 1.5, ...inputSx }} />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel>Order Type</FieldLabel>
          <Select fullWidth value={orderType} size="small" onChange={(e) => dispatch(setOrderType(e.target.value as 'Dine In' | 'To Go' | 'Delivery'))}
            sx={{ bgcolor: '#2D303E', color: 'white', borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#393C49' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#EA7C69' } }}>
            <MenuItem value="Dine In">Dine In</MenuItem>
            <MenuItem value="To Go">To Go</MenuItem>
            <MenuItem value="Delivery">Delivery</MenuItem>
          </Select>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel>Table no.</FieldLabel>
          <TextField fullWidth value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder="e.g. 140" size="small" sx={inputSx} />
        </Box>
      </Box>

      <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
        <Button fullWidth variant="outlined" size="large" onClick={() => setShowPayment(false)}
          sx={{ borderRadius: 1, borderColor: '#EA7C69', color: '#EA7C69', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#d96a57', bgcolor: 'rgba(234,124,105,0.08)' } }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" size="large" onClick={handleConfirm} disabled={isLoading || items.length === 0}
          sx={{ borderRadius: 1, fontWeight: 700, bgcolor: '#EA7C69', textTransform: 'none', '&:hover': { bgcolor: '#d96a57' } }}>
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Payment'}
        </Button>
      </Box>
    </Box>
  );

  const panelContent = (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {orderSuccess ? successContent : orderPanelContent}
      {showPayment && !orderSuccess && paymentPanelContent}
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
          <IconButton onClick={() => setMobileOpen(true)} sx={{ bgcolor: '#EA7C69', color: 'white', width: 64, height: 64, boxShadow: 6 }}>
            <Badge badgeContent={items.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
        <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {panelContent}
        </Drawer>
      </>
    );
  }

  return panelContent;
}
