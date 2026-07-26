/**
 * Categories page. The user can:
 *  - See every category with product count + total value.
 *  - Add new categories (via Formik).
 *  - Delete a category - existing products get re-assigned to "Uncategorised".
 */
import { useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, FolderKanban } from 'lucide-react';

import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, colorClasses } from '../lib/utils';
import Modal from '../components/ui/Modal';
import CategoryForm from '../components/products/CategoryForm';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { Formik, Form } from 'formik';
import { TextField } from '../components/ui/Field';
import { categorySchema, type CategoryFormValues } from '../lib/validation';

export default function CategoriesPage() {
  const { categories, products, updateCategory, deleteCategory } =
    useInventory();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; color: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const stats = useMemo(() => {
    return categories.map((c) => {
      const items = products.filter((p) => p.category === c.name);
      return {
        category: c,
        count: items.length,
        value: items.reduce((s, p) => s + p.price * p.stock, 0),
      };
    });
  }, [categories, products]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Categories
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organise your products into logical groups.
          </p>
        </div>
        <Button iconLeft={<Plus size={16} />} onClick={() => setAdding(true)}>
          New category
        </Button>
      </div>

      {stats.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={20} />}
          title="No categories yet"
          description="Create your first category to start organising products."
          action={
            <Button iconLeft={<Plus size={16} />} onClick={() => setAdding(true)}>
              New category
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ category, count, value }) => {
            const palette = colorClasses(category.color);
            return (
              <div
                key={category.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {category.name}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({ id: category.id, name: category.name, color: category.color })
                      }
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(category.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {count}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      product{count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {formatCurrency(value)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">inventory value</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Create category"
        description="Pick a clear, short name."
        size="sm"
      >
        <CategoryForm
          onCreated={() => {
            setAdding(false);
          }}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit category"
        size="sm"
      >
        {editing && (
          <EditCategoryForm
            initial={editing}
            onSubmit={(values) => {
              updateCategory(editing.id, values);
              toast.success('Category updated');
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete category?"
        message="Products in this category will be moved to 'Uncategorised'. You can re-assign them later."
        confirmText="Delete"
        destructive
        onConfirm={() => {
          if (deleting) {
            const cat = categories.find((c) => c.id === deleting);
            deleteCategory(deleting);
            if (cat) toast.success(`Deleted "${cat.name}"`);
            setDeleting(null);
          }
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function EditCategoryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
}) {
  return (
    <Formik
      enableReinitialize
      initialValues={initial}
      validationSchema={categorySchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <TextField label="Category name" name="name" required autoFocus />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} iconLeft={<Pencil size={16} />}>
              Save changes
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
