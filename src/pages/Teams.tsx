/**
 * Teams Management Page
 * Full CRUD for teams within organizations
 * Following DRY, KISS, and SOLID principles
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  Building2,
  Settings,
  Trash2,
  Edit3,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  UserPlus,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { teamsService, organizationsService } from '@/api/services';
import type { Organization, User } from '@/types';

// Team type definition
interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  leadId?: string | null;
  lead?: User | null;
}

// ============================================================================
// Types
// ============================================================================

interface TeamWithOrg extends Team {
  organization?: Organization;
}

// ============================================================================
// Components
// ============================================================================

const CreateTeamModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (team: Team) => void;
  organizations: Organization[];
}> = ({ isOpen, onClose, onSuccess, organizations }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [organizationId, setOrganizationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && organizations.length > 0 && !organizationId) {
      setOrganizationId(organizations[0]!.id);
    }
  }, [isOpen, organizations, organizationId]);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await teamsService.createTeam(organizationId, {
        name,
        description,
        color,
      });
      onSuccess(response.data);
      setName('');
      setDescription('');
      setColor('#3b82f6');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Team</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
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
              Team name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Platform Engineering"
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
              placeholder="Team description"
              rows={2}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Team color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all",
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
                "flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors",
                (isLoading || !name.trim() || !organizationId) && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamCard: React.FC<{
  team: TeamWithOrg;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ team, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Users className="w-5 h-5" style={{ color: team.color || '#3b82f6' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{team.name}</h3>
            <p className="text-sm text-slate-500">{team.memberCount} members</p>
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
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <hr className="my-1 border-slate-800" />
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
        {team.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between">
        {team.organization && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Building2 className="w-3 h-3" />
            {team.organization.name}
          </span>
        )}
        {team.lead && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Crown className="w-3 h-3 text-amber-400" />
            {team.lead.name}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Teams Component
// ============================================================================

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<TeamWithOrg[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const orgsRes = await organizationsService.listOrganizations();
        const orgs = orgsRes.data.data || [];
        setOrganizations(orgs);

        // Fetch teams from all organizations
        const allTeams: TeamWithOrg[] = [];
        for (const org of orgs) {
          try {
            const teamsRes = await teamsService.listTeams(org.id);
            const orgTeams = (teamsRes.data || []).map((team) => ({
              ...team,
              organization: org,
            }));
            allTeams.push(...orgTeams);
          } catch {
            // Skip organizations where we can't fetch teams
          }
        }
        setTeams(allTeams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = (newTeam: Team) => {
    const org = organizations.find((o) => o.id === newTeam.organizationId);
    setTeams((prev) => [{ ...newTeam, organization: org }, ...prev]);
  };

  const handleDeleteTeam = async (team: TeamWithOrg) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await teamsService.deleteTeam(team.organizationId, team.id);
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
    } catch {
      alert('Failed to delete team');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
        <p className="text-slate-400">
          Manage teams within your organizations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Team
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={() => {/* TODO */}}
              onDelete={() => handleDeleteTeam(team)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? 'No teams match your search' : 'No teams yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchQuery ? 'Try a different search term' : 'Create your first team to organize members'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Team
            </button>
          )}
        </div>
      )}

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateTeam}
        organizations={organizations}
      />
    </div>
  );
};

export default Teams;
