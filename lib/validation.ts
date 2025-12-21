import { z } from 'zod';

/**
 * User Registration Schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .refine((email) => email.endsWith('.edu.gh'), {
      message: 'Email must be a valid .edu.gh email address',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format').optional().or(z.literal('')),
});

/**
 * User Login Schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format').optional(),
});

/**
 * Student Verification Request Schema
 */
export const verificationRequestSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  campus: z.string().min(1, 'Campus is required'),
});

/**
 * Verification Code Schema
 */
export const verificationCodeSchema = z.object({
  verificationCode: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^[0-9]{6}$/, 'Verification code must contain only numbers'),
});

/**
 * Product Creation Schema
 */
export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum([
    'TOPS',
    'BOTTOMS',
    'DRESSES',
    'OUTERWEAR',
    'SHOES',
    'ACCESSORIES',
  ]),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  brand: z.string().optional(),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR', 'VINTAGE']),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.object({
    imageUrl: z.string().url('Invalid image URL'),
    isPrimary: z.boolean(),
  })).optional(),
});

/**
 * Add to Cart Schema
 */
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

/**
 * Update Cart Item Schema
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

/**
 * Create Order Schema
 */
export const createOrderSchema = z.object({
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  campusZone: z.string().min(1, 'Campus zone is required'),
  paymentMethod: z.enum(['CARD', 'MOBILE_MONEY', 'INSTALLMENT']),
  deliveryFee: z.number().min(0).optional().default(0),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).optional(),
});

/**
 * Payday Flex Initialize Schema
 */
export const paydayFlexSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  paydayDate: z
    .string()
    .datetime()
    .refine(
      (date) => {
        const payday = new Date(date);
        const now = new Date();
        const minDays = 7;
        const maxDays = 30;
        const diffDays = Math.ceil((payday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= minDays && diffDays <= maxDays;
      },
      {
        message: 'Payday date must be between 7 and 30 days from now',
      }
    ),
});

/**
 * Update Order Status Schema
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

/**
 * Initialize Payday Flex Payment Schema
 */
export const initializePaydayFlexSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  paydayDate: z.string().datetime().refine(
    (date) => {
      const payday = new Date(date);
      const now = new Date();
      const minDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      return payday >= minDate && payday <= maxDate;
    },
    {
      message: 'Payday date must be between 7 and 30 days from now',
    }
  ),
});

/**
 * Update Delivery Status Schema
 */
export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
});

/**
 * Register Campus Rider Schema
 */
export const registerCampusRiderSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  zoneId: z.string().cuid('Invalid zone ID'),
});

/**
 * Update Rider Availability Schema
 */
export const updateRiderAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Style Match Schema (for image URL input)
 */
export const styleMatchSchema = z.object({
  imageUrl: z.string().url('Invalid image URL').optional(),
});

/**
 * Create Review Schema
 */
export const createReviewSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be at most 1000 characters').optional(),
});

/**
 * Add to Wishlist Schema
 */
export const addToWishlistSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
});
