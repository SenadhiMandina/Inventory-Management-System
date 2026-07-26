/**
 * Form used by both the Restock and Sell modals. The "direction" prop
 * determines which context mutator we call.
 */
import { Formik, Form } from 'formik';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { stockChangeSchema, type StockChangeFormValues } from '../../lib/validation';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { NumberField, TextArea } from '../ui/Field';
import Button from '../ui/Button';

interface Props {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  direction: 'restock' | 'sell';
  onDone: () => void;
}

export default function StockForm({ productId, productName, productSku, currentStock, direction, onDone }: Props) {
  const { restock, sell } = useInventory();
  const toast = useToast();

  const initialValues: StockChangeFormValues = { amount: 1, note: '' };
  const isRestock = direction === 'restock';

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={stockChangeSchema}
      onSubmit={(values, { setSubmitting }) => {
        if (direction === 'sell' && values.amount > currentStock) {
          toast.error(`Only ${currentStock} unit(s) in stock`);
          setSubmitting(false);
          return;
        }
        if (isRestock) {
          restock(productId, values.amount, values.note || undefined);
          toast.success(`Restocked +${values.amount} ${productName}`);
        } else {
          sell(productId, values.amount, values.note || undefined);
          toast.success(`Sold -${values.amount} ${productName}`);
        }
        setSubmitting(false);
        onDone();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">{productName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {productSku} · Current stock: <span className="font-semibold">{currentStock}</span>
            </p>
          </div>

          <NumberField
            label={isRestock ? 'Quantity to add' : 'Quantity to remove'}
            name="amount"
            min="1"
            step="1"
            required
          />

          <TextArea
            label="Note (optional)"
            name="note"
            placeholder={isRestock ? 'e.g. New shipment from supplier' : 'e.g. Sale order #1234'}
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onDone}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isRestock ? 'success' : 'danger'}
              loading={isSubmitting}
              iconLeft={isRestock ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            >
              {isRestock ? 'Restock' : 'Record sale'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
