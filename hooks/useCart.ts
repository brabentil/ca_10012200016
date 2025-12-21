import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useCartStore, CartItem } from '@/lib/stores/cart';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useCart() {
  const queryClient = useQueryClient();
  const { items, itemCount, totalAmount, addItem: addToStore, updateQuantity: updateInStore, removeItem: removeFromStore, setCart } = useCartStore();

  // Fetch cart from API
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get('/cart');
      return response.data.data.items || [];
    },
  });

  // Sync cart data with store
  useEffect(() => {
    if (cartData) {
      setCart(cartData);
    }
  }, [cartData, setCart]);

  // Add item mutation
  const { mutate: addItem, isPending: isAdding } = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const response = await apiClient.post('/cart/items', { product_id: productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item added to cart');
    },
    onError: () => {
      toast.error('Failed to add item to cart');
    },
  });

  // Update quantity mutation
  const { mutate: updateQuantity, isPending: isUpdating } = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart updated');
    },
    onError: () => {
      toast.error('Failed to update cart');
    },
  });

  // Remove item mutation
  const { mutate: removeItem, isPending: isRemoving } = useMutation({
    mutationFn: async (itemId: string) => {
      await apiClient.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  return {
    items,
    itemCount,
    totalAmount,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    isAdding,
    isUpdating,
    isRemoving,
  };
}
