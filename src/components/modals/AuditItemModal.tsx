import { 
  AlertCircle, 
  FileText, 
  GitPullRequest, 
  UserX, 
  AlertTriangle, 
  HelpCircle 
} from 'lucide-react';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalActionButton } from '@/components/ui/Modal';
import { AUDIT_TYPES } from '@/lib/constants';
import { ICON_MAP } from '@/lib/icon-map';

const TYPE_CONFIG = {
  [AUDIT_TYPES.JIRA]: {
    icon: AlertCircle,
    iconClassName: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    title: 'Jira Context Mismatch',
    infoBoxClass: 'bg-amber-500/5 border-amber-500/20'
  },
  [AUDIT_TYPES.DOC]: {
    icon: FileText,
    iconClassName: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    title: 'Documentation Drift',
    infoBoxClass: 'bg-blue-500/5 border-blue-500/20'
  },
  [AUDIT_TYPES.PR]: {
    icon: GitPullRequest,
    iconClassName: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    title: 'Pull Request Conflict',
    infoBoxClass: 'bg-purple-500/5 border-purple-500/20'
  },
  [AUDIT_TYPES.OWNER]: {
    icon: UserX,
    iconClassName: 'bg-red-500/20',
    iconColor: 'text-red-400',
    title: 'Stale Component Owner',
    infoBoxClass: 'bg-red-500/5 border-red-500/20'
  }
};

interface AuditItem {
  type: keyof typeof TYPE_CONFIG;
  details: {
    issue?: string;
    document?: string;
    pr?: string;
    component?: string;
    summary?: string;
    impact?: string;
    title?: string;
    lastUpdated?: string;
    driftMetrics?: {
      filesCompliant: number;
      filesDrifted: number;
      complianceRate: string;
    };
    author?: string;
    conflicts?: Array<{
      policy: string;
      section: string;
      prApproach: string;
      standardApproach: string;
    }>;
    domain?: string;
    previousOwner?: string;
    pendingItems?: {
      criticalBugs: number;
      openPRs: number;
      untriagedIssues: number;
    };
    problem: string;
    suggestedActions: Array<{
      id: string;
      label: string;
      description: string;
      icon: string;
    }>;
  };
}

interface AuditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditItem: AuditItem | null;
}

export const AuditItemModal = ({ isOpen, onClose, auditItem }: AuditItemModalProps) => {
  if (!auditItem) return null;

  const config = TYPE_CONFIG[auditItem.type as keyof typeof TYPE_CONFIG];
  if (!config) return null;
  
  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        icon={<IconComponent size={16} className={config.iconColor} />}
        iconClassName={config.iconClassName}
        title={config.title}
        subtitle={String(auditItem.details.issue || auditItem.details.document || auditItem.details.pr || auditItem.details.component || '')}
        onClose={onClose}
      />

      <ModalContent>
        {/* Problem Description */}
        <div className={`p-4 rounded-xl border ${config.infoBoxClass}`}>
          <h4 className={`text-xs font-bold uppercase mb-2 ${config.iconColor}`}>Issue Description</h4>
          <p className="text-sm text-slate-300">{auditItem.details.problem}</p>
        </div>

        {/* Type-Specific Details */}
        <TypeSpecificDetails details={auditItem.details} type={auditItem.type} />

        {/* Suggested Actions */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Suggested Actions</h4>
          <div className="space-y-3">
            {auditItem.details.suggestedActions.map(action => {
              const ActionIcon = ICON_MAP[action.icon as keyof typeof ICON_MAP] || HelpCircle;
              return (
                <ModalActionButton
                  key={action.id}
                  icon={ActionIcon}
                  label={action.label}
                  description={action.description}
                  color={getActionColor(action.id)}
                />
              );
            })}
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          Dismiss
        </button>
      </ModalFooter>
    </Modal>
  );
};

interface TypeSpecificDetailsProps {
  details: AuditItem['details'];
  type: AuditItem['type'];
}

const TypeSpecificDetails = ({ details, type }: TypeSpecificDetailsProps) => {
  switch (type) {
    case AUDIT_TYPES.JIRA:
      return (
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Jira Summary" value={details.summary} />
          <DetailItem label="Impact" value={details.impact} />
        </div>
      );

    case AUDIT_TYPES.DOC:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <DetailItem label="Document" value={details.document} />
            <DetailItem label="Title" value={details.title} />
            <DetailItem label="Last Updated" value={details.lastUpdated} />
          </div>
          <div className="grid grid-cols-3 gap-4 p-3 bg-slate-800/30 rounded-lg">
            <MetricItem label="Files Compliant" value={details.driftMetrics?.filesCompliant} />
            <MetricItem label="Files Drifted" value={details.driftMetrics?.filesDrifted} highlight />
            <MetricItem label="Compliance" value={details.driftMetrics?.complianceRate} />
          </div>
        </div>
      );

    case AUDIT_TYPES.PR:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="PR Title" value={details.title} />
            <DetailItem label="Author" value={details.author} />
          </div>
          {details.conflicts && (
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Policy Conflict</h5>
              {details.conflicts.map((conflict, i) => (
                <div key={i} className="text-sm space-y-1">
                  <p className="text-slate-300"><span className="text-slate-500">Policy:</span> {conflict.policy} ({conflict.section})</p>
                  <p className="text-slate-400 text-[11px]"><span className="text-red-400">PR:</span> {conflict.prApproach}</p>
                  <p className="text-slate-400 text-[11px]"><span className="text-emerald-400">Standard:</span> {conflict.standardApproach}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case AUDIT_TYPES.OWNER:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Component" value={details.component} />
            <DetailItem label="Domain" value={details.domain} />
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-sm text-slate-300">Previous Owner: <span className="text-slate-400">{details.previousOwner}</span></span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricItem label="Critical Bugs" value={details.pendingItems?.criticalBugs} highlight />
            <MetricItem label="Open PRs" value={details.pendingItems?.openPRs} />
            <MetricItem label="Untriaged Issues" value={details.pendingItems?.untriagedIssues} />
          </div>
        </div>
      );

    default:
      return null;
  }
};

interface DetailItemProps {
  label: string;
  value?: string | number | null;
}

const DetailItem = ({ label, value }: DetailItemProps) => (
  <div>
    <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
    <p className="text-sm text-slate-300 mt-0.5">{value?.toString() ?? '-'}</p>
  </div>
);

interface MetricItemProps {
  label: string;
  value?: string | number;
  highlight?: boolean;
}

const MetricItem = ({ label, value, highlight }: MetricItemProps) => (
  <div className="text-center">
    <p className={`text-lg font-bold ${highlight ? 'text-red-400' : 'text-slate-200'}`}>{value ?? '-'}</p>
    <p className="text-[10px] text-slate-500 uppercase">{label}</p>
  </div>
);

const getActionColor = (actionId: string): 'blue' | 'purple' | 'red' | 'emerald' | 'amber' => {
  if (actionId.includes('update') || actionId.includes('amend')) return 'blue';
  if (actionId.includes('split') || actionId.includes('refactor') || actionId.includes('assign')) return 'emerald';
  if (actionId.includes('revert') || actionId.includes('deprecate')) return 'amber';
  if (actionId.includes('request') || actionId.includes('override') || actionId.includes('escalate')) return 'red';
  return 'blue';
};
