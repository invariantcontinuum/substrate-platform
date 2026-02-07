/**
 * Sidebar Component
 * Updated with Project Dashboard and proper navigation
 */

import React from 'react';
import { PanelLeft, PanelLeftClose, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/api/hooks';
import { useAppStore, useIsSyncing } from '@/stores';
import { NavButton } from '@/components/ui/NavButton';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen = true,
}) => {
  const isSyncing = useIsSyncing();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const { data: navigation } = useNavigation();

  const navItems = navigation?.main || [];
  const bottomItems = navigation?.bottom || [];

  if (!isOpen) {
    return (
      <div className="w-12 border-r border-slate-800 bg-slate-900/30 flex flex-col items-center py-4 z-10 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft size={18} className="text-slate-400" />
        </button>
        <nav className="mt-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                activeTab === item.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
              title={item.label}
            >
              <DynamicIcon name={item.icon} size={18} />
            </button>
          ))}
        </nav>
        <nav className="space-y-2 pb-4">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                activeTab === item.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
              title={item.label}
            >
              <DynamicIcon name={item.icon} size={18} />
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col z-10 shrink-0">
      <div className="p-2 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={18} className="text-slate-400" />
        </button>
      </div>

      <nav className="px-4 pb-4 space-y-1 flex-1">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            icon={<DynamicIcon name={item.icon} size={18} />}
            label={item.label}
            isLoading={item.id === 'graph' && isSyncing}
          />
        ))}
      </nav>

      <nav className="px-4 pb-4 space-y-1">
        {bottomItems.map((item) => (
          <NavButton
            key={item.id}
            active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            icon={<DynamicIcon name={item.icon} size={18} />}
            label={item.label}
          />
        ))}
      </nav>


      <div className="p-4 border-t border-slate-800/50">
        <div className="p-4 bg-blue-600/5 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-blue-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase">Knowledge Streak</h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 1, 1, 0, 0, 0, 0].map((v, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    v ? 'bg-blue-500' : 'bg-slate-700'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-bold">3 DAYS</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 italic">
            Logging prevents architectural entropy.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
