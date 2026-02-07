import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICON_MAP } from '@/lib/icons';

interface DynamicIconProps extends React.ComponentPropsWithoutRef<'svg'> {
    name: string;
    size?: number | string;
    className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
    name,
    size = 18,
    className,
    ...props
}) => {
    const IconComponent = ICON_MAP[name] || LayoutDashboard;

    // Lucide icons expect specific props, but accept SVG props generally.
    // Casting to 'any' avoids strict type mismatch between LucideIcon and SVGProps for now.
    return <IconComponent size={size as number} className={cn(className)} {...(props as any)} />;
};
