/**
 * Yup validation schemas shared by every form.
 *
 * Centralising them here means:
 *  - One place to look when the interviewer asks "how do you validate?"
 *  - Add/edit forms use the SAME rules, so behaviour is consistent.
 */

import * as Yup from 'yup';

export const productSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters')
    .required('Product name is required'),
  sku: Yup.string()
    .trim()
    // PRD-482910 style SKU: 3 letters, dash, 6 digits.
    .matches(/^[A-Z]{3}-\d{6}$/, 'SKU must look like "PRD-482910"')
    .required('SKU is required'),
  category: Yup.string()
    .trim()
    .min(1, 'Pick or create a category')
    .required('Category is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be greater than 0')
    .max(1_000_000, 'Price is unrealistically high')
    .required('Price is required'),
  stock: Yup.number()
    .typeError('Stock must be a number')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(1_000_000, 'Stock is unrealistically high')
    .required('Stock quantity is required'),
});

export const categorySchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(30, 'Category must be at most 30 characters')
    .required('Category name is required'),
  color: Yup.string().required('Pick a colour'),
});

export const stockChangeSchema = Yup.object({
  amount: Yup.number()
    .typeError('Amount must be a number')
    .integer('Amount must be a whole number')
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'That is a huge change')
    .required('Amount is required'),
  note: Yup.string().max(120, 'Note must be at most 120 characters'),
});

export type ProductFormValues = Yup.InferType<typeof productSchema>;
export type CategoryFormValues = Yup.InferType<typeof categorySchema>;
export type StockChangeFormValues = Yup.InferType<typeof stockChangeSchema>;
