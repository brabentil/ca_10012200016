export interface Product {
  product_id: number;
  seller_id: number;
  product_name: string;
  description: string;
  category: string;
  brand: string | null;
  size: string | null;
  color: string | null;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  price: number;
  quantity: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  display_order: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
