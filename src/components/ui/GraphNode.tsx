import React from 'react';
import { Node } from '@/components/ui/Node';
import { ICON_MAP } from '@/lib/icon-map';
import { LucideIcon, Box } from 'lucide-react';

interface ComponentNode {
  id: string;
  label: string;
  icon: string;
  altIcon?: string;
  position: { x: string; y: string };
  colors: Record<string, 'blue' | 'purple' | 'red' | 'slate'>;
}

interface GraphNodeProps {
  node: ComponentNode;
  currentLens: string;
  isDrift: boolean;
}

export const GraphNode: React.FC<GraphNodeProps> = ({ node, currentLens, isDrift }) => {
  const { id, label, icon, altIcon, position, colors } = node;

  const color = colors[currentLens] || 'slate';
  const IconComponent = (ICON_MAP as Record<string, LucideIcon>)[isDrift && altIcon ? altIcon : icon] || Box;

  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Node
        icon={<IconComponent size={id === 'core_api' ? 20 : 16} />}
        label={label}
        color={color}
      />
    </div>
  );
};
