import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rawMaterialsApi } from './api/rawMaterialsApi';
import { productsApi } from './api/productsApi';
import { ordersApi } from './api/ordersApi';
import { dashboardApi } from './api/dashboardApi';
import cartReducer from './slices/cartSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    settings: settingsReducer,
    [rawMaterialsApi.reducerPath]: rawMaterialsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      rawMaterialsApi.middleware,
      productsApi.middleware,
      ordersApi.middleware,
      dashboardApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
