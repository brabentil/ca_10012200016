import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
  image_url: string;
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
      
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          );
          return {
            items: updatedItems,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            totalAmount: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        }),
      
      removeItem: (productId) =>
        set((state) => {
          const filteredItems = state.items.filter(
            (item) => item.product_id !== productId
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
    }
  )
);
