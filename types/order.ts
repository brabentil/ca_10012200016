import { Product } from './product';

export interface Order {
  order_id: number;
  user_id: number;
  order_status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  campus_zone: string;
  dorm_name: string;
  room_number: string;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product: Product;
}

export interface CreateOrderInput {
  items: {
    product_id: number;
    quantity: number;
  }[];
  campus_zone: string;
  dorm_name: string;
  room_number: string;
  special_instructions?: string;
  payment_method: 'card' | 'mobile_money' | 'payday_flex';
  payday_date?: string;
}
