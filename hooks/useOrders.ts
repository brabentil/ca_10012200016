import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Order, CreateOrderInput } from '@/types/order';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useOrders() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch all orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get<{ orders: Order[] }>('/orders');
      return response.data.orders;
    },
  });

  // Fetch single order
  const useOrder = (orderId: number) => {
    return useQuery({
      queryKey: ['order', orderId],
      queryFn: async () => {
        const response = await apiClient.get<{ order: Order }>(`/orders/${orderId}`);
        return response.data.order;
      },
      enabled: !!orderId,
    });
  };

  // Create order mutation
  const { mutate: createOrder, isPending: isCreating } = useMutation({
    mutationFn: async (orderData: CreateOrderInput) => {
      const response = await apiClient.post<{ order: Order; payment_url?: string }>('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully');
      
      // Redirect to payment if payment URL is provided
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        router.push(`/orders/${data.order.order_id}`);
      }
    },
    onError: () => {
      toast.error('Failed to place order');
    },
  });

  return {
    orders,
    isLoading,
    useOrder,
    createOrder,
    isCreating,
  };
}
