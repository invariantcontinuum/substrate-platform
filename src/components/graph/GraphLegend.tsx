/**
 * Graph Legend Component
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { LensType, LegendItemConfig } from '@/types';

interface GraphLegendProps {
  items: LegendItemConfig[];
  activeLens: LensType;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({
  items,
  activeLens,
}) => {
  const visibleItems = items.filter((item) =>
    item.lenses.includes(activeLens)
  );

  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        Legend
      </h4>
      {visibleItems.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <div
            className={cn(
              "w-3 h-0.5",
              item.dashed && "border-t-2 border-dashed bg-transparent",
              !item.dashed && item.color
            )}
            style={item.dashed ? { borderColor: 'currentColor' } : undefined}
          />
          <span className="text-xs text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default GraphLegend;
