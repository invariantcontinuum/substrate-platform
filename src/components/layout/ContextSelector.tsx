/**
 * Context Selector Component
 * Organization and Project switcher for multi-tenant navigation
 * Follows DRY principle with reusable components
 */

import React, { useState } from 'react';
import {
  Building2,
  FolderKanban,
  ChevronDown,
  Plus,
  Search,
  Check,
  Settings,
  Users,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCurrentProject,
  useCurrentOrganization,
  useOrganizations,
  useProjects,
  useProjectStore,
  useUserOrganizations,
  useUserProjects,
} from '@/stores';
import type { Organization, Project } from '@/types';

// ============================================================================
// Organization Item Component
// ============================================================================

interface OrganizationItemProps {
  organization: Organization;
  isActive: boolean;
  onClick: () => void;
}

const OrganizationItem: React.FC<OrganizationItemProps> = ({ organization, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
        isActive 
          ? "bg-blue-500/10 border border-blue-500/20" 
          : "hover:bg-slate-800 border border-transparent"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
        isActive ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400"
      )}>
        {organization.avatar ? (
          <img src={organization.avatar} alt={organization.name} className="w-full h-full rounded-lg object-cover" />
        ) : (
          organization.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isActive ? "text-blue-400" : "text-slate-200")}>
          {organization.name}
        </p>
        <p className="text-xs text-slate-500 truncate">{organization.plan} plan</p>
      </div>
      {isActive && <Check size={16} className="text-blue-400 shrink-0" />}
    </button>
  );
};

// ============================================================================
// Project Item Component
// ============================================================================

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors group",
        isActive 
          ? "bg-blue-500/10 border border-blue-500/20" 
          : "hover:bg-slate-800 border border-transparent"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        isActive ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
      )}>
        <FolderKanban size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isActive ? "text-blue-400" : "text-slate-200")}>
          {project.name}
        </p>
        <div className="flex items-center gap-2">
          {project.status === 'setup' && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
              Setup
            </span>
          )}
          <p className="text-xs text-slate-500 truncate">
            {project.stats?.totalNodes || 0} entities
          </p>
        </div>
      </div>
      {isActive && <Check size={14} className="text-blue-400 shrink-0" />}
    </button>
  );
};

// ============================================================================
// Main Context Selector
// ============================================================================

export const ContextSelector: React.FC = () => {
  const currentOrg = useCurrentOrganization();
  const currentProject = useCurrentProject();
  const switchOrganization = useProjectStore((state) => state.switchOrganization);
  const switchProject = useProjectStore((state) => state.switchProject);
  const setContextPanelOpen = useProjectStore((state) => state.setContextPanelOpen);
  const isOpen = useProjectStore((state) => state.isContextPanelOpen);
  
  const [activeTab, setActiveTab] = useState<'organizations' | 'projects'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch data
  const { data: organizations = [] } = useUserOrganizations();
  const { data: projects = [] } = useUserProjects();

  // Filter by search
  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!currentOrg || p.organizationId === currentOrg.id)
  );

  const handleOrgClick = (org: Organization) => {
    switchOrganization(org.id);
    // If current project doesn't belong to new org, clear it
    if (currentProject && currentProject.organizationId !== org.id) {
      // Will be handled by switchOrganization
    }
  };

  const handleProjectClick = (project: Project) => {
    switchProject(project.id);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setContextPanelOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          {currentOrg ? (
            <>
              <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-400">
                  {currentOrg.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-slate-400 max-w-[100px] truncate">{currentOrg.name}</span>
                {currentProject && (
                  <>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-200 max-w-[120px] truncate">{currentProject.name}</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-400">Select Project...</span>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-400" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setContextPanelOpen(false)}
      />
      
      {/* Panel */}
      <div className="fixed top-16 left-4 w-[400px] max-h-[calc(100vh-100px)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Switch Context</h2>
          <button 
            onClick={() => setContextPanelOpen(false)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <ArrowRight size={16} className="text-slate-400 rotate-180" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('projects')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === 'projects' 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-slate-400 hover:text-slate-300"
            )}
          >
            <FolderKanban size={16} />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === 'organizations' 
                ? "text-blue-400 border-b-2 border-blue-400" 
                : "text-slate-400 hover:text-slate-300"
            )}
          >
            <Building2 size={16} />
            Organizations
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'organizations' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Your Organizations ({filteredOrgs.length})
                </span>
              </div>
              {filteredOrgs.map((org) => (
                <OrganizationItem
                  key={org.id}
                  organization={org}
                  isActive={currentOrg?.id === org.id}
                  onClick={() => handleOrgClick(org)}
                />
              ))}
              <button className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors mt-4">
                <Plus size={16} />
                <span className="text-sm">Create Organization</span>
              </button>
            </>
          ) : (
            <>
              {currentOrg && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Building2 size={14} className="text-slate-500" />
                  <span className="text-xs font-medium text-slate-500">
                    {currentOrg.name}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {filteredProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isActive={currentProject?.id === project.id}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
              {filteredProjects.length === 0 && (
                <div className="text-center py-8">
                  <FolderKanban size={32} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No projects found</p>
                </div>
              )}
              <button className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors mt-4">
                <Plus size={16} />
                <span className="text-sm">Create Project</span>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <Users size={14} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">john.doe@example.com</p>
              <p className="text-xs text-slate-500">Engineer</p>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Settings">
              <Settings size={16} className="text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Sign Out">
              <LogOut size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContextSelector;
