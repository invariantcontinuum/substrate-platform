/**
 * Projects Management Page
 * Full CRUD for projects with organization context
 * Following DRY, KISS, and SOLID principles
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  FolderKanban,
  Building2,
  Users,
  Settings,
  Trash2,
  Edit3,
  Archive,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Activity,
  GitBranch,
  Shield,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectsService, organizationsService } from '@/api/services';
import { useAuthStore, useProjectStore } from '@/stores';
import type { Project, Organization } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ProjectsProps {
  onSelectProject: (project: Project) => void;
  onGoToDashboard: () => void;
  onLogout: () => void;
}

interface ProjectWithOrg extends Project {
  organization?: Organization;
}

// ============================================================================
// Components
// ============================================================================

const CreateProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
  organizations: Organization[];
}> = ({ isOpen, onClose, onSuccess, organizations }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && organizations.length > 0 && !organizationId) {
      setOrganizationId(organizations[0]!.id);
    }
  }, [isOpen, organizations, organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectsService.createProject({
        name,
        description,
        organizationId,
      });
      onSuccess(response.data);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
              <span className="text-slate-500 ml-1">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project"
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization
            </label>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !organizationId}
              className={cn(
                "flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2",
                (isLoading || !name.trim() || !organizationId) && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{
  project: ProjectWithOrg;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}> = ({ project, onSelect, onEdit, onDelete, onArchive }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'archived':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'setup':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{project.name}</h3>
            <p className="text-sm text-slate-500">{project.slug}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit project
                </button>
                <button
                  onClick={() => { onArchive(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  {project.status === 'archived' ? 'Restore' : 'Archive'}
                </button>
                <hr className="my-1 border-slate-800" />
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {project.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={cn(
            "px-2 py-1 text-xs font-medium border rounded-full",
            getStatusColor(project.status)
          )}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          {project.organization && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="w-3 h-3" />
              {project.organization.name}
            </span>
          )}
        </div>
        <button
          onClick={onSelect}
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Open
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Projects Component
// ============================================================================

export const Projects: React.FC<ProjectsProps> = ({ onSelectProject, onGoToDashboard, onLogout }) => {
  const [projects, setProjects] = useState<ProjectWithOrg[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { user } = useAuthStore();
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const setCurrentOrganization = useProjectStore((state) => state.setCurrentOrganization);

  // Fetch projects and organizations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [projectsRes, orgsRes] = await Promise.all([
          projectsService.listProjects(),
          organizationsService.listOrganizations(),
        ]);
        
        const orgs = orgsRes.data.data || [];
        setOrganizations(orgs);
        
        // Enrich projects with organization data
        const enrichedProjects = (projectsRes.data.data || []).map((project) => ({
          ...project,
          organization: orgs.find((o) => o.id === project.organizationId),
        }));
        
        setProjects(enrichedProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectProject = (project: Project) => {
    const org = organizations.find((o) => o.id === project.organizationId);
    setCurrentProject(project);
    if (org) setCurrentOrganization(org);
    onSelectProject(project);
    onGoToDashboard();
  };

  const handleCreateProject = (newProject: Project) => {
    const org = organizations.find((o) => o.id === newProject.organizationId);
    const enrichedProject = { ...newProject, organization: org };
    setProjects((prev) => [enrichedProject, ...prev]);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      await projectsService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert('Failed to delete project: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleArchiveProject = async (project: Project) => {
    try {
      if (project.status === 'archived') {
        await projectsService.restoreProject(project.id);
      } else {
        await projectsService.archiveProject(project.id);
      }
      
      setProjects((prev) => prev.map((p) =>
        p.id === project.id
          ? { ...p, status: project.status === 'archived' ? 'active' : 'archived' }
          : p
      ));
    } catch (err) {
      alert('Failed to archive/restore project');
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    archived: projects.filter((p) => p.status === 'archived').length,
    setup: projects.filter((p) => p.status === 'setup').length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Substrate</span>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-slate-400 hidden sm:block">
                  {user.name}
                </span>
              )}
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-300">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">
            Manage your projects and select one to view the dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-400">Setup</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.setup}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Archive className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Archived</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.archived}</p>
          </div>
        </div>

        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="setup">Setup</option>
            <option value="archived">Archived</option>
          </select>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Projects grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={() => handleSelectProject(project)}
                    onEdit={() => {/* TODO: Implement edit */}}
                    onDelete={() => handleDeleteProject(project.id)}
                    onArchive={() => handleArchiveProject(project)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderKanban className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No projects match your filters'
                    : 'No projects yet'}
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first project to get started'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Project
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateProject}
        organizations={organizations}
      />
    </div>
  );
};

export default Projects;
