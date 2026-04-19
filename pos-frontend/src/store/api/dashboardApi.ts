import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RawMaterial } from './rawMaterialsApi';
import { Order } from './ordersApi';

export interface MostOrderedItem {
  _id: string;
  productName: string;
  totalQuantity: number;
  image: string;
}

export interface OrderTypeBreakdown {
  _id: string;
  count: number;
}

export interface RevenueByDay {
  _id: string;
  revenue: number;
  orders: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalDishes: number;
  completedOrders: number;
  mostOrdered: MostOrderedItem[];
  orderTypeBreakdown: OrderTypeBreakdown[];
  recentOrders: Order[];
  lowStockMaterials: RawMaterial[];
  revenueByDay: RevenueByDay[];
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    fetchFn: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  }),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
      providesTags: ['Dashboard'],
      // Poll every 30 seconds
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
