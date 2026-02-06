import React from 'react';
import { LegendItem } from '@/components/ui/LegendItem';

interface FilteredLegendItem {
  id: string | number;
  color: string;
  label: string;
  dashed?: boolean;
  lenses: string[]; // or SyncType[]
}

interface FilteredLegendProps {
  items: FilteredLegendItem[];
  currentLens: string;
}

export const FilteredLegend: React.FC<FilteredLegendProps> = ({ items, currentLens }) => {
  const visibleItems = items.filter(item => item.lenses.includes(currentLens));

  if (visibleItems.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
      {visibleItems.map(item => (
        <LegendItem
          key={item.id}
          color={item.color}
          label={item.label}
          dashed={item.dashed}
        />
      ))}
    </div>
  );
};
