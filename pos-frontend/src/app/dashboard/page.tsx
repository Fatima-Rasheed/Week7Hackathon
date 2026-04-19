'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { PieChart } from '@mui/x-charts/PieChart';
import { useGetDashboardSummaryQuery } from '@/store/api/dashboardApi';

// Brand palette
const PINK = '#EA7C69';
const ORANGE = '#FFB572';
const BLUE = '#65B0F6';

// Status pill colors (bg with alpha, text)
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Completed: { bg: '#6BE2BE3D', color: '#6BE2BE' },
  Preparing: { bg: '#9290FE33', color: '#9290FE' },
  Pending:   { bg: '#FFB57233', color: '#FFB572' },
  Cancelled: { bg: 'rgba(244,67,54,0.2)', color: '#f44336' },
};

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading, isError, refetch } = useGetDashboardSummaryQuery(undefined, {
    pollingInterval: 5000,
    refetchOnMountOrArgChange: true,
  });

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: PINK }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>
        }>
          Failed to load dashboard. Is the backend running?
        </Alert>
      </Box>
    );
  }

  // Compute revenue change % from revenueByDay (today vs yesterday)
  const revenueChange = (() => {
    const days = data?.revenueByDay ?? [];
    if (days.length < 2) return null;
    const todayRev = days[days.length - 1]?.revenue ?? 0;
    const yesterdayRev = days[days.length - 2]?.revenue ?? 0;
    if (yesterdayRev === 0) return null;
    return parseFloat((((todayRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1));
  })();

  const orderTypeData = data?.orderTypeBreakdown.map((item) => ({
    id: item._id,
    value: item.count,
    label: item._id,
    color: item._id === 'Dine In' ? PINK : item._id === 'To Go' ? ORANGE : BLUE,
  })) ?? [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{todayLabel}</Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* ── Left column ── */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              {
                iconSrc: '/$.png',
                value: `$${(data?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                label: 'Total Revenue',
                change: revenueChange,
                accent: PINK,
              },
              {
                iconSrc: '/Bookmark.png',
                value: (data?.totalOrders ?? 0).toLocaleString(),
                label: 'Total Orders',
                change: null as number | null,
                accent: ORANGE,
              },
              {
                iconSrc: '/Customer.png',
                value: (data?.completedOrders ?? 0).toLocaleString(),
                label: 'Total Customer',
                change: null as number | null,
                accent: BLUE,
              },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          {/* Order Report */}
          <Card sx={{ borderRadius: '8px', overflow: 'hidden', minHeight: 506 }}>
            <CardContent sx={{ pt: '24px', px: { xs: 2, sm: 3 }, pb: 3, gap: '16px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Order Report</Typography>
     <Button
  variant="outlined"
  size="small"
  startIcon={
    <Box
      component="img"
      src="/Option.png"
      alt="filter"
      className="filter-icon"
      sx={{
        width: 20, // 🔥 bigger icon
        height: 20,
        filter: 'brightness(0) invert(1)',
        transition: 'all 0.2s',
         color: 'text.primary',
      }}
    />
  }
  sx={{
    borderRadius: '10px',
    borderColor: 'rgba(255,255,255,0.15)',
    color: 'text.primary',
    textTransform: 'none',

    // 🔥 SIZE CONTROL
    fontSize: '0.95rem',
    px: 3,   // more width
    py: 1.6, // more height

    '&:hover': {
      borderColor: BLUE,
      color: BLUE,
    },
  }}
>
  Filter Order
</Button>
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: isMobile ? 340 : 'auto' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', pb: 1.5 }}>Customer</TableCell>
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', pb: 1.5 }}>Menu</TableCell>
                      {!isMobile && (
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', pb: 1.5 }}>Total Payment</TableCell>
                      )}
                      <TableCell sx={{ color: 'text.primary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', pb: 1.5 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.recentOrders.map((order) => {
                      const style = STATUS_STYLES[order.status] ?? { bg: 'rgba(255,255,255,0.1)', color: 'white' };
                      return (
                        <TableRow key={order._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: `hsl(${(order.customerName?.charCodeAt(0) ?? 65) * 5}, 60%, 45%)`,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                {order.customerName?.[0] ?? 'G'}
                              </Avatar>
                              <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 70, sm: 130 }, fontWeight: 500 }}>
                                {order.customerName || 'Guest'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.5 }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 80, sm: 200 }, color: 'text.secondary' }}>
                              {order.items[0]?.productName ?? '-'}
                            </Typography>
                          </TableCell>
                          {!isMobile && (
                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${order.subTotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.5 }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.4,
                                borderRadius: '6px',
                                bgcolor: style.bg,
                                color: style.color,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {order.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!data?.recentOrders || data.recentOrders.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 3 : 4} align="center" sx={{ py: 4, border: 'none' }}>
                          <Typography sx={{ color: 'text.secondary' }} variant="body2">No orders yet</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right column ── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Most Ordered */}
          
                  <Card sx={{ mb: 3, borderRadius: '8px' }}>
            <CardContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '20px', '&:last-child': { pb: '24px' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Most Ordered</Typography>
                <Button
                  size="small"
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{ bgcolor: '#1F1D2B', color: 'white', borderRadius: '8px', textTransform: 'none', fontSize: '0.8rem', px: 1.5, '&:hover': { bgcolor: '#393C49' } }}
                >
                  Today
                </Button>

              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', }}>
                {data?.mostOrdered.length ? data.mostOrdered.map((item) => (
                  <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={item.image || 'https://placehold.co/56x56?text=Dish'}
                      alt={item.productName}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56?text=Dish'; }}
                      sx={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'white' }}>{item.productName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.totalQuantity} dishes ordered</Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography sx={{ color: 'text.secondary', textAlign: 'center' }} variant="body2">No data yet</Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderRadius: '8px', borderColor: PINK, color: PINK, textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: PINK, bgcolor: `${PINK}15` } }}
              >
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Most Type of Order */}
          <Card sx={{ borderRadius: '8px' }}>
            <CardContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '20px', '&:last-child': { pb: '24px' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Most Type of Order</Typography>
                <Button
                  size="small"
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{ bgcolor: '#1F1D2B', color: 'white', borderRadius: '8px', textTransform: 'none', fontSize: '0.8rem', px: 1.5, '&:hover': { bgcolor: '#393C49' } }}
                >
                  Today
                </Button>
              </Box>
              {orderTypeData.length > 0 ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart
                      series={[{ data: orderTypeData, innerRadius: isTablet ? 45 : 55, outerRadius: isTablet ? 75 : 90, paddingAngle: 4, cornerRadius: 5 }]}
                      width={isTablet ? 220 : 260}
                      height={isTablet ? 170 : 200}
                      margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      slotProps={{ legend: { sx: { display: 'none' } } }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orderTypeData.map((item) => (
                      <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 'auto' }}>{item.value} customers</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center' }} variant="body2">No order data yet</Typography>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          {data?.lowStockMaterials && data.lowStockMaterials.length > 0 && (
            <Card sx={{ mt: 3, border: '1px solid', borderColor: 'warning.main', borderRadius: '8px' }}>
              <CardContent sx={{ p: '24px', '&:last-child': { pb: '24px' } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main', mb: 1.5 }}>⚠ Low Stock Alert</Typography>
                {data.lowStockMaterials.map((mat) => (
                  <Box key={mat._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{mat.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>{mat.currentStock} {mat.unit} left</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  iconSrc,
  value,
  label,
  change,
  accent,
}: {
  iconSrc: string;
  value: string;
  label: string;
  change: number | null;
  accent: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <Card
      sx={{
        borderRadius: '8px',
        width: '100%',
        minHeight: 143,
        p: 0,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${accent}30` },
      }}
    >
      <CardContent
        sx={{
          p: '16px',
          gap: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          '&:last-child': { pb: '16px' },
        }}
      >
        {/* Top row: icon + badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: `${accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Box component="img" src={iconSrc} alt={label} sx={{ width: 22, height: 22, objectFit: 'contain' }} />
          </Box>
          {change !== null && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                bgcolor: isPositive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                borderRadius: '6px',
                px: 0.75,
                py: 0.3,
              }}
            >
              {isPositive
                ? <TrendingUpIcon sx={{ fontSize: 13, color: 'success.main' }} />
                : <TrendingDownIcon sx={{ fontSize: 13, color: 'error.main' }} />}
              <Typography variant="caption" sx={{ fontWeight: 700, color: isPositive ? 'success.main' : 'error.main', lineHeight: 1 }}>
                {isPositive ? '+' : ''}{change}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Value */}
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' }, color: 'white', lineHeight: 1.1 }}>
          {value}
        </Typography>

        {/* Label */}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
