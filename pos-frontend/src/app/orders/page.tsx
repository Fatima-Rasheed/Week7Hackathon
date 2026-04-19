'use client';

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
  Select,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api/ordersApi';

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
  Completed: 'success',
  Preparing: 'info',
  Pending: 'warning',
  Cancelled: 'error',
};

export default function OrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useGetOrdersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 5000,
  });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' } }}>Orders</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Manage and track all orders
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      )}
      {isError && (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>
        }>
          Failed to load orders.
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          {/* Mobile card list */}
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {orders?.map((order) => (
                <Card key={order._id}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: `hsl(${(order.customerName?.charCodeAt(0) ?? 65) * 5}, 60%, 50%)`, fontSize: '0.6rem' }}>
                        {order.customerName?.[0] ?? 'G'}
                      </Avatar>
                      <Typography variant="body2">{order.customerName || 'Guest'}</Typography>
                      <Chip label={order.type} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }} noWrap>
                      {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>${order.subTotal.toFixed(2)}</Typography>
                      <Select
                        value={order.status}
                        size="small"
                        onChange={(e) => updateStatus({ id: order._id, status: e.target.value })}
                        sx={{ fontSize: '0.75rem', minWidth: 110 }}
                        renderValue={(val) => (
                          <Chip label={val} color={statusColors[val] ?? 'default'} size="small" sx={{ fontWeight: 600, cursor: 'pointer' }} />
                        )}
                      >
                        {['Completed', 'Preparing', 'Pending', 'Cancelled'].map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {orders?.length === 0 && (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No orders yet</Typography>
              )}
            </Box>
          ) : (
            /* Desktop table */
            <Card>
              <CardContent sx={{ p: 0 }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Order #</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Payment</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders?.map((order) => (
                        <TableRow key={order._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {order.orderNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: `hsl(${(order.customerName?.charCodeAt(0) ?? 65) * 5}, 60%, 50%)`, fontSize: '0.65rem' }}>
                                {order.customerName?.[0] ?? 'G'}
                              </Avatar>
                              <Typography variant="body2">{order.customerName || 'Guest'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={order.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>${order.subTotal.toFixed(2)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{order.paymentMethod}</Typography>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              size="small"
                              onChange={(e) => updateStatus({ id: order._id, status: e.target.value })}
                              sx={{ fontSize: '0.75rem', minWidth: 110 }}
                              renderValue={(val) => (
                                <Chip label={val} color={statusColors[val] ?? 'default'} size="small" sx={{ fontWeight: 600, cursor: 'pointer' }} />
                              )}
                            >
                              {['Completed', 'Preparing', 'Pending', 'Cancelled'].map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography sx={{ color: 'text.secondary', py: 3 }}>No orders yet</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
