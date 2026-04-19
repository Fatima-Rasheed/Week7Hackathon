import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { productsApi } from './productsApi';

export interface RawMaterial {
  _id: string;
  name: string;
  unit: 'g' | 'ml' | 'pcs';
  currentStock: number;
  minStockAlert?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRawMaterialDto {
  name: string;
  unit: 'g' | 'ml' | 'pcs';
  currentStock: number;
  minStockAlert?: number;
}

export const rawMaterialsApi = createApi({
  reducerPath: 'rawMaterialsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    fetchFn: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  }),
  tagTypes: ['RawMaterial'],
  endpoints: (builder) => ({
    getRawMaterials: builder.query<RawMaterial[], void>({
      query: () => '/raw-materials',
      providesTags: ['RawMaterial'],
    }),
    getLowStockMaterials: builder.query<RawMaterial[], void>({
      query: () => '/raw-materials/low-stock',
      providesTags: ['RawMaterial'],
    }),
    createRawMaterial: builder.mutation<RawMaterial, CreateRawMaterialDto>({
      query: (body) => ({
        url: '/raw-materials',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RawMaterial'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(productsApi.util.invalidateTags(['Product']));
      },
    }),
    updateRawMaterial: builder.mutation<
      RawMaterial,
      { id: string; data: Partial<CreateRawMaterialDto> }
    >({
      query: ({ id, data }) => ({
        url: `/raw-materials/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['RawMaterial'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(productsApi.util.invalidateTags(['Product']));
      },
    }),
    deleteRawMaterial: builder.mutation<void, string>({
      query: (id) => ({
        url: `/raw-materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RawMaterial'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(productsApi.util.invalidateTags(['Product']));
      },
    }),
  }),
});

export const {
  useGetRawMaterialsQuery,
  useGetLowStockMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
} = rawMaterialsApi;
