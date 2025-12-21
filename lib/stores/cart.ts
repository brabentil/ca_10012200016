import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cart_item_id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  price: number;
  image_url: string | null;
  condition: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      totalAmount: 0,
      
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.product_id === item.product_id
          );
          
          if (existingItem) {
            const updatedItems = state.items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
            return {
              items: updatedItems,
              itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
              totalAmount: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
            };
          }
          
          const newItems = [...state.items, item];
          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }),
      
      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.cart_item_id === cartItemId ? { ...item, quantity } : item
          );
          return {
            items: updatedItems,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }),
      
      removeItem: (cartItemId) =>
        set((state) => {
          const filteredItems = state.items.filter(
            (item) => item.cart_item_id !== cartItemId
          );
          return {
            items: filteredItems,
            itemCount: filteredItems.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: filteredItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }),
      
      clearCart: () => set({ items: [], itemCount: 0, totalAmount: 0 }),
      
      setCart: (items) =>
        set({
          items,
          itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
          totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
    }),
    {
      name: 'cart-storage',
      version: 1, // Increment this to invalidate old cached data
    }
  )
);
