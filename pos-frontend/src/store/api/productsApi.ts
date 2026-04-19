import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RecipeItem {
  rawMaterialId: string;
  quantityRequired: number;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  recipe: RecipeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithAvailability extends Product {
  availableQty: number;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  image?: string;
  recipe: RecipeItem[];
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    fetchFn: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    getProductsAvailability: builder.query<ProductWithAvailability[], void>({
      query: () => '/products/availability',
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, CreateProductDto>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<
      Product,
      { id: string; data: Partial<CreateProductDto> }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsAvailabilityQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
