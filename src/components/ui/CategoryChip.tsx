/**
 * A pill that represents a category. Colour comes from the category itself.
 */
import type { Category } from '../../types';
import { colorClasses } from '../../lib/utils';

interface Props {
  category: Category | string;
  size?: 'xs' | 'sm';
  onRemove?: () => void;
}

export default function CategoryChip({ category, size = 'sm', onRemove }: Props) {
  const name = typeof category === 'string' ? category : category.name;
  const color = typeof category === 'string' ? 'slate' : category.color;
  const palette = colorClasses(color);
  const sizeClass =
    size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ring-1 ${palette.bg} ${palette.text} ${palette.ring} ${sizeClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current opacity-70`}
        aria-hidden
      />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 ml-0.5 grid h-4 w-4 place-items-center rounded-full text-current opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
