import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { productsApi } from './productsApi';
import { rawMaterialsApi } from './rawMaterialsApi';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  type: 'Dine In' | 'To Go' | 'Delivery';
  tableNo?: string;
  items: OrderItem[];
  discount: number;
  subTotal: number;
  status: 'Completed' | 'Preparing' | 'Pending' | 'Cancelled';
  paymentMethod: 'Credit Card' | 'PayPal' | 'Cash';
  customerName?: string;
  createdAt: string;
}

export interface CreateOrderDto {
  type: 'Dine In' | 'To Go' | 'Delivery';
  tableNo?: string;
  items: OrderItem[];
  discount?: number;
  subTotal: number;
  paymentMethod: 'Credit Card' | 'PayPal' | 'Cash';
  customerName?: string;
  note?: string;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    fetchFn: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation<Order, CreateOrderDto>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
      // Also invalidate products and raw materials availability since stock changed
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(productsApi.util.invalidateTags(['Product']));
        dispatch(rawMaterialsApi.util.invalidateTags(['RawMaterial']));
      },
    }),
    updateOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = ordersApi;
