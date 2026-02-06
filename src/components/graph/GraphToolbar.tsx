/**
 * Graph Toolbar Component
 */

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit?: () => void;
  onToggleLayout?: () => void;
  className?: string;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  onToggleLayout,
  className,
}) => {
  const buttonClass = cn(
    "p-2 rounded-lg transition-all duration-200",
    "text-muted-foreground hover:text-foreground hover:bg-muted",
    "focus:outline-none focus:ring-2 focus:ring-primary/50"
  );

  return (
    <div className={cn(
      "absolute top-4 right-4 z-10 flex flex-col gap-1",
      "bg-card/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-xl",
      className
    )}>
      <button onClick={onZoomIn} className={buttonClass} title="Zoom In">
        <ZoomIn size={16} />
      </button>
      <button onClick={onZoomOut} className={buttonClass} title="Zoom Out">
        <ZoomOut size={16} />
      </button>
      <button onClick={onReset} className={buttonClass} title="Reset View">
        <RotateCcw size={16} />
      </button>
      {onFit && (
        <button onClick={onFit} className={buttonClass} title="Fit to Screen">
          <Maximize size={16} />
        </button>
      )}
      {onToggleLayout && (
        <>
          <div className="h-px bg-border mx-1 my-1" />
          <button onClick={onToggleLayout} className={buttonClass} title="Change Layout">
            <Layers size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default GraphToolbar;
