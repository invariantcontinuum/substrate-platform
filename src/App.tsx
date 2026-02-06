/**
 * Main Application Component
 * Multi-tenant, API-first architecture with role-based access
 * Refactored following SOLID principles
 */

import React, { useCallback, useEffect } from 'react';
import { useAppStore, useActiveTab, useSidebarOpen } from '@/stores';
import { 
  useProjectStore, 
  useCurrentProject, 
  useCurrentOrganization,
} from '@/stores';
import { useQuickSync, useCurrentUser, useUserOrganizations, useUserProjects } from '@/hooks';
import { cn } from '@/lib/utils';

// Layout Components
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

// Page Components
import { ProjectDashboard } from '@/pages/ProjectDashboard';
import { KnowledgeFabric } from '@/pages/KnowledgeFabric';
import { MemoryInterface } from '@/pages/MemoryInterface';
import { RAGInterface } from '@/pages/RAGInterface';
import { PolicyView } from '@/pages/PolicyView';
import { TerminalLogs } from '@/pages/TerminalLogs';
import { Settings } from '@/pages/Settings';

/**
 * ProjectGuard - Ensures a project is selected before showing project-scoped pages
 */
const ProjectGuard: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const currentProject = useCurrentProject();
  return currentProject ? <>{children}</> : <>{fallback}</>;
};

/**
 * NoProjectSelected - Placeholder when no project is selected
 */
const NoProjectSelected: React.FC = () => {
  const setContextPanelOpen = useProjectStore((state) => state.setContextPanelOpen);
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-10 h-10 text-slate-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-300 mb-2">Select a Project</h2>
        <p className="text-slate-500 mb-6">
          Choose an organization and project from the dropdown above, or create a new one to get started.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={() => setContextPanelOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
          >
            Select Project
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-medium transition-colors">
            Create New
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AppInitializer - Handles initial data loading and project context setup
 */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setCurrentUser = useProjectStore((state) => state.setCurrentUser);
  const setOrganizations = useProjectStore((state) => state.setOrganizations);
  const setProjects = useProjectStore((state) => state.setProjects);
  const currentOrg = useCurrentOrganization();
  const currentProject = useCurrentProject();
  const setCurrentOrganization = useProjectStore((state) => state.setCurrentOrganization);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const setCurrentMember = useProjectStore((state) => state.setCurrentMember);
  const setLoading = useProjectStore((state) => state.setLoading);

  // Fetch current user
  const { data: user } = useCurrentUser();
  
  // Fetch user's organizations and projects
  const { data: organizations = [] } = useUserOrganizations();
  const { data: projects = [] } = useUserProjects();

  // Set user data
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user, setCurrentUser]);

  // Set organizations and projects
  useEffect(() => {
    setOrganizations(organizations);
    setProjects(projects);
  }, [organizations, projects, setOrganizations, setProjects]);

  // Auto-select first org/project if none selected
  useEffect(() => {
    if (!currentOrg && organizations.length > 0) {
      setCurrentOrganization(organizations[0] ?? null);
    }
    if (!currentProject && projects.length > 0) {
      // Prefer project from current org
      const orgProject = currentOrg 
        ? projects.find(p => p.organizationId === currentOrg.id)
        : null;
      const selectedProject = orgProject ?? projects[0];
      setCurrentProject(selectedProject ?? null);
      
      // Set mock member for now
      if (selectedProject) {
        setCurrentMember({
          id: 'member-1',
          userId: user?.id || 'user-1',
          projectId: selectedProject.id,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          permissions: [],
        });
      }
    }
    setLoading(false);
  }, [currentOrg, currentProject, organizations, projects, setCurrentOrganization, setCurrentProject, setCurrentMember, setLoading, user]);

  return <>{children}</>;
};

/**
 * Main App Component
 */
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
    <AppInitializer>
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
              {activeTab === 'dashboard' && (
                <ProjectDashboard />
              )}
              {activeTab === 'graph' && (
                <ProjectGuard fallback={<NoProjectSelected />}>
                  <KnowledgeFabric 
                    onSync={handleSync} 
                    isSyncing={isSyncing}
                  />
                </ProjectGuard>
              )}
              {activeTab === 'memory' && (
                <ProjectGuard fallback={<NoProjectSelected />}>
                  <MemoryInterface />
                </ProjectGuard>
              )}
              {activeTab === 'rag' && (
                <ProjectGuard fallback={<NoProjectSelected />}>
                  <RAGInterface />
                </ProjectGuard>
              )}
              {activeTab === 'policy' && (
                <ProjectGuard fallback={<NoProjectSelected />}>
                  <PolicyView />
                </ProjectGuard>
              )}
              {activeTab === 'terminal' && <TerminalLogs />}
              {activeTab === 'settings' && <Settings />}
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </AppInitializer>
  );
};

export default App;
