import { useAppContext } from '../context/AppContext';
import { CategorySlug } from '../types/scholarship';

interface CategoryTagProps {
  slug: CategorySlug | string;
  compact?: boolean;
}

export function CategoryTag({ slug, compact = false }: CategoryTagProps) {
  const { categories } = useAppContext();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border text-xs font-medium whitespace-nowrap shrink-0 ${cat.surfaceClass} ${cat.textClass} ${cat.borderClass}`}
    >
      <span className={`w-2 h-2 rounded-[2px] shrink-0 ${cat.swatchClass}`} aria-hidden="true" />
      <span>{compact ? cat.shortName : cat.name}</span>
    </span>
  );
}
