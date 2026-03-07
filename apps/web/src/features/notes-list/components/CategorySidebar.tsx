import { Stack } from '@/notesDS/primitives/stack';
import { Row } from '@/notesDS/primitives/row';
import { Small } from '@/notesDS/components/ui/typography';
import { cn } from '@/notesDS/utils/cn';

type SidebarCategory = {
  id: string;
  title: string;
  noteCount: number;
  colorClasses: { dot: string; bg: string };
};

type CategorySidebarProps = {
  categories: SidebarCategory[];
  selectedCategoryId: string | undefined;
  onSelectCategory: (id: string | undefined) => void;
};

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <Stack gap={1} className="w-48 shrink-0 pt-1">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={cn(
          'cursor-pointer rounded px-2 py-1 text-left transition-colors hover:bg-secondary',
          selectedCategoryId === undefined && 'font-bold',
        )}
      >
        <Small className={cn('text-foreground', selectedCategoryId === undefined && 'font-bold')}>
          All Categories
        </Small>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'cursor-pointer rounded px-2 py-1 text-left transition-colors hover:bg-secondary',
              isSelected && 'bg-secondary',
            )}
          >
            <Row gap={2} align="center" justify="between">
              <Row gap={2} align="center">
                <span
                  className={cn('h-2.5 w-2.5 shrink-0 rounded-full', cat.colorClasses.dot)}
                />
                <Small className={cn('text-foreground', isSelected && 'font-bold')}>
                  {cat.title}
                </Small>
              </Row>
              <Small>{cat.noteCount}</Small>
            </Row>
          </button>
        );
      })}
    </Stack>
  );
}
