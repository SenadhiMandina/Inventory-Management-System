/**
 * The shared Add/Edit product form.
 *
 * Same Formik form for create + edit: the parent's `product` prop tells us
 * which one we're doing. Re-using one form means validation behaviour is
 * identical and we don't have drift between the two screens.
 */
import { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import { RotateCw, Sparkles, Tag, Plus } from 'lucide-react';
import * as Yup from 'yup';

import type { Product } from '../../types';
import {
  productSchema,
  type ProductFormValues,
} from '../../lib/validation';
import { generateUniqueSku } from '../../lib/sku';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { TextField, NumberField, SelectField } from '../ui/Field';
import Button from '../ui/Button';

interface Props {
  product?: Product;
  onSubmit: () => void;
  onCancel?: () => void;
}

const EMPTY: ProductFormValues = {
  name: '',
  sku: '',
  category: '',
  price: 0,
  stock: 0,
};

export default function ProductForm({ product, onSubmit, onCancel }: Props) {
  // Pull exactly what we need from the context. Using the hook directly
  // (instead of prop-drilling) keeps the form self-contained and easy to
  // re-use inside any modal in the future.
  const { categories, products, addCategory, addProduct, updateProduct } =
    useInventory();
  const toast = useToast();
  const isEdit = !!product;

  const initialValues = useMemo<ProductFormValues>(
    () =>
      product
        ? {
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            stock: product.stock,
          }
        : EMPTY,
    [product]
  );

  const [newCategory, setNewCategory] = useState('');

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (productSchema as any).test(
          'unique-sku',
          'This SKU is already in use',
          function (this: Yup.TestContext, value: unknown) {
            // `value` is the object being validated; pull `sku` from it.
            const sku = ((value as ProductFormValues)?.sku || '').toUpperCase();
            if (!sku) return true;
            const taken = products.some(
              (p) => p.sku.toUpperCase() === sku && p.id !== product?.id
            );
            return !taken;
          }
        )
      }
      onSubmit={(values, { setSubmitting, resetForm }) => {
        // If the user typed a brand-new category, create it first so the
        // dropdown below it can stay in sync with reality.
        let categoryName = values.category;
        if (newCategory.trim()) {
          const created = addCategory(newCategory.trim(), 'indigo');
          if (!created) {
            toast.error('That category already exists');
            setSubmitting(false);
            return;
          }
          categoryName = created.name;
        }

        const finalSku =
          values.sku?.trim() ||
          generateUniqueSku(products.map((p) => p.sku));

        if (isEdit && product) {
          updateProduct(product.id, {
            name: values.name.trim(),
            sku: finalSku.toUpperCase(),
            category: categoryName,
            price: values.price,
            stock: values.stock,
          });
          toast.success('Product updated');
        } else {
          addProduct({
            name: values.name.trim(),
            sku: finalSku.toUpperCase(),
            category: categoryName,
            price: values.price,
            stock: values.stock,
          });
          toast.success('Product added');
          resetForm();
        }
        onSubmit();
        setSubmitting(false);
      }}
    >
      {({ setFieldValue, isSubmitting }) => {
        const generateSku = () => {
          const sku = generateUniqueSku(products.map((p) => p.sku));
          setFieldValue('sku', sku);
        };

        return (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Product Name"
                name="name"
                placeholder="e.g. Wireless Mouse"
                required
                autoFocus
              />
              <div>
                <TextField
                  label="SKU"
                  name="sku"
                  required
                  placeholder="PRD-000000"
                  hint="3 letters, dash, 6 digits."
                  iconLeft={<Tag size={14} />}
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateSku}
                    className="-mt-2 mb-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Sparkles size={12} />
                    Auto-generate
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Category"
                name="category"
                required
                hint="Pick an existing one or type a new one below."
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </SelectField>

              <div className="space-y-1.5">
                <label
                  htmlFor="newCategory"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Or create a new category
                </label>
                <input
                  id="newCategory"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Outdoor Gear"
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <p className="min-h-[1.1rem] text-xs text-slate-500 dark:text-slate-400">
                  Leave blank to use the dropdown above.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField label="Price (USD)" name="price" min="0" step="0.01" required />
              <NumberField label="Stock Quantity" name="stock" min="0" step="1" required />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {onCancel && (
                <Button variant="secondary" type="button" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                iconLeft={isEdit ? <RotateCw size={16} /> : <Plus size={16} />}
              >
                {isEdit ? 'Save changes' : 'Add product'}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
