import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  note: string;
  availableQty: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'Dine In' | 'To Go' | 'Delivery';
  discount: number;
}

const initialState: CartState = {
  items: [],
  orderType: 'Dine In',
  discount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity' | 'note'>>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (existing) {
        if (existing.quantity < existing.availableQty) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1, note: '' });
      }
    },
    incrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.productId === action.payload);
      if (item && item.quantity < item.availableQty) {
        item.quantity += 1;
      }
    },
    decrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.productId === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (i) => i.productId !== action.payload,
          );
        }
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    updateNote(
      state,
      action: PayloadAction<{ productId: string; note: string }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) item.note = action.payload.note;
    },
    setOrderType(
      state,
      action: PayloadAction<'Dine In' | 'To Go' | 'Delivery'>,
    ) {
      state.orderType = action.payload;
    },
    setDiscount(state, action: PayloadAction<number>) {
      state.discount = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.discount = 0;
    },
    updateAvailableQty(
      state,
      action: PayloadAction<{ productId: string; availableQty: number }>,
    ) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (item) {
        item.availableQty = action.payload.availableQty;
        if (item.quantity > action.payload.availableQty) {
          item.quantity = action.payload.availableQty;
        }
      }
    },
  },
});

export const {
  addToCart,
  incrementItem,
  decrementItem,
  removeFromCart,
  updateNote,
  setOrderType,
  setDiscount,
  clearCart,
  updateAvailableQty,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectOrderType = (state: { cart: CartState }) =>
  state.cart.orderType;
export const selectDiscount = (state: { cart: CartState }) =>
  state.cart.discount;
