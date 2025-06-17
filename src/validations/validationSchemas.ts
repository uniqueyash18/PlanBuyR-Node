import { z } from 'zod';

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Category Validation Schemas
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional()
});

// Plan Validation Schemas
export const planSchema = z.object({
  postId: z.string().min(24, 'Invalid post ID'),
  duration: z.string().min(1, 'Duration is required'),
  price: z.string().min(1, 'Price is required'),
  comparePrice: z.string().optional(),
  features: z.array(z.string()).min(1, 'At least one feature is required')
});

// Post Validation Schemas
export const postSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(24, 'Invalid category ID')
});

// Banner Validation Schemas
export const bannerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  imageUrl: z.string().url('Invalid image URL'),
  linkedCategoryId: z.string().min(24, 'Invalid category ID').optional(),
  linkedPlanId: z.string().min(24, 'Invalid plan ID').optional()
});

// Pagination Validation Schema
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '10'))
}); 