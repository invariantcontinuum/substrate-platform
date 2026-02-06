/**
 * Modal Component
 */

import React from 'react';
import { X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={cn(
        "w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden",
        className
      )} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  icon?: React.ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ icon, iconClassName, title, subtitle, onClose }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
    <div className="flex items-center gap-3">
      {icon && (
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconClassName)}>
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-500 uppercase">{subtitle}</p>}
      </div>
    </div>
    {onClose && (
      <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
        <X size={18} className="text-slate-400" />
      </button>
    )}
  </div>
);

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({ children, className }) => (
  <div className={cn("p-6 space-y-6", className)}>
    {children}
  </div>
);

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div className={cn("flex justify-end gap-3 px-6 py-4 bg-slate-800/30 border-t border-slate-700", className)}>
    {children}
  </div>
);

interface ModalActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  onClick?: () => void;
}

export const ModalActionButton: React.FC<ModalActionButtonProps> = ({ icon: Icon, label, description, color = 'blue', onClick }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', hoverBg: 'group-hover:bg-blue-500/20', text: 'text-blue-400', border: 'group-hover:border-blue-500/50' },
    purple: { bg: 'bg-purple-500/10', hoverBg: 'group-hover:bg-purple-500/20', text: 'text-purple-400', border: 'group-hover:border-purple-500/50' },
    emerald: { bg: 'bg-emerald-500/10', hoverBg: 'group-hover:bg-emerald-500/20', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/50' },
    amber: { bg: 'bg-amber-500/10', hoverBg: 'group-hover:bg-amber-500/20', text: 'text-amber-400', border: 'group-hover:border-amber-500/50' },
    red: { bg: 'bg-red-500/10', hoverBg: 'group-hover:bg-red-500/20', text: 'text-red-400', border: 'group-hover:border-red-500/50' }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all group",
        colors.border
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg, colors.hoverBg)}>
        <Icon size={18} className={colors.text} />
      </div>
      <div className="flex-1 text-left">
        <h5 className="text-sm font-medium text-slate-200">{label}</h5>
        <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
};

interface ModalInfoBoxProps {
  children: React.ReactNode;
  color?: 'blue' | 'purple' | 'red' | 'emerald';
}

export const ModalInfoBox: React.FC<ModalInfoBoxProps> = ({ children, color = 'blue' }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400' },
    red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-400' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={cn("p-4 rounded-xl border", colors.bg, colors.border)}>
      {children}
    </div>
  );
};
