/**
 * Quick "create a new category" form. Mirrors the ProductForm pattern.
 */
import { Formik, Form } from 'formik';
import { Plus } from 'lucide-react';

import { categorySchema, type CategoryFormValues } from '../../lib/validation';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { TextField, SelectField } from '../ui/Field';
import Button from '../ui/Button';
import { CATEGORY_COLORS } from '../../lib/utils';

interface Props {
  onCreated?: () => void;
}

export default function CategoryForm({ onCreated }: Props) {
  const { addCategory } = useInventory();
  const toast = useToast();
  const initialValues: CategoryFormValues = { name: '', color: 'indigo' };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={categorySchema}
      onSubmit={(values, { resetForm, setSubmitting }) => {
        const created = addCategory(values.name, values.color);
        if (!created) {
          toast.error('That category already exists');
          setSubmitting(false);
          return;
        }
        toast.success(`Category "${created.name}" created`);
        resetForm();
        onCreated?.();
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <TextField
            label="Category name"
            name="name"
            placeholder="e.g. Outdoor Gear"
            required
            autoFocus
          />
          <SelectField label="Colour tag" name="color" required>
            {CATEGORY_COLORS.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </SelectField>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              iconLeft={<Plus size={16} />}
            >
              Create category
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
