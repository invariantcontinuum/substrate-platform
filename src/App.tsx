/**
 * Main Application Component
 * Refactored following SOLID principles
 */

import React, { useCallback } from 'react';
import { useAppStore, useActiveTab, useSidebarOpen } from '@/stores';
import { useQuickSync } from '@/hooks';
import { cn } from '@/lib/utils';

// Layout Components
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

// Page Components
import { KnowledgeFabric } from '@/pages/KnowledgeFabric';
import { MemoryInterface } from '@/pages/MemoryInterface';
import { RAGInterface } from '@/pages/RAGInterface';
import { PolicyView } from '@/pages/PolicyView';
import { TerminalLogs } from '@/pages/TerminalLogs';
import { Settings } from '@/pages/Settings';

const App: React.FC = () => {
  const activeTab = useActiveTab();
  const sidebarOpen = useSidebarOpen();
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const addLog = useAppStore((state) => state.addLog);
  const { sync, isSyncing } = useQuickSync();

  // Handle tab change with logging
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    addLog({
      time: new Date().toLocaleTimeString(),
      msg: `Switched to ${tab} view`,
      level: 'debug',
    });
  }, [setActiveTab, addLog]);

  // Handle sync operations
  const handleSync = useCallback((type: 'reality' | 'intent') => {
    sync(type);
    addLog({
      time: new Date().toLocaleTimeString(),
      msg: `${type} sync initiated`,
      level: 'info',
    });
  }, [sync, addLog]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
        />
        
        <main className={cn(
          "flex-1 relative overflow-hidden bg-slate-950 transition-all duration-300",
          !sidebarOpen && "ml-0"
        )}>
          {/* Page Content */}
          <div className="h-full">
            {activeTab === 'graph' && (
              <KnowledgeFabric 
                onSync={handleSync} 
                isSyncing={isSyncing}
              />
            )}
            {activeTab === 'memory' && <MemoryInterface />}
            {activeTab === 'rag' && <RAGInterface />}
            {activeTab === 'policy' && <PolicyView />}
            {activeTab === 'terminal' && <TerminalLogs />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default App;
