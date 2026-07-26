/**
 * Form primitives tuned for Formik.
 *
 * The Formik docs recommend you wrap Field/ErrorMessage, so each input
 * looks the same and shows validation errors the same way.
 */
import { Field, ErrorMessage, useField } from 'formik';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseProps {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  iconLeft?: ReactNode;
}

const fieldClasses =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800';

export function TextField({
  label,
  name,
  required,
  hint,
  iconLeft,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const [, meta] = useField(name);
  const hasError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <div className="relative">
        {iconLeft && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            {iconLeft}
          </span>
        )}
        <Field
          id={name}
          name={name}
          {...rest}
          className={`${fieldClasses} ${iconLeft ? 'pl-10' : ''} ${
            hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
          }`}
        />
      </div>
      <FieldMessage name={name} hint={hint} />
    </div>
  );
}

export function NumberField(props: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <TextField {...props} type="number" inputMode="numeric" />
  );
}

export function TextArea({
  label,
  name,
  required,
  hint,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [, meta] = useField(name);
  const hasError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <Field
        as="textarea"
        id={name}
        name={name}
        rows={3}
        {...rest}
        className={`${fieldClasses} resize-none ${
          hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
        }`}
      />
      <FieldMessage name={name} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  required,
  hint,
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const [, meta] = useField(name);
  const hasError = meta.touched && !!meta.error;
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <Field
        as="select"
        id={name}
        name={name}
        {...rest}
        className={`${fieldClasses} ${
          hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
        }`}
      >
        {children}
      </Field>
      <FieldMessage name={name} hint={hint} />
    </div>
  );
}

function FieldMessage({ name, hint }: { name: string; hint?: string }) {
  return (
    <div className="min-h-[1.1rem] text-xs">
      <ErrorMessage name={name}>
        {(msg) => (
          <p className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <AlertCircle size={12} />
            {msg}
          </p>
        )}
      </ErrorMessage>
      {!hint && <span>&nbsp;</span>}
      {hint && !name.endsWith('_hint') && (
        <p className="text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}
