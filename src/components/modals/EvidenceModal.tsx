import { useState } from 'react';
import {
  FileText,
  GitPullRequest,
  Copy,
  ExternalLink,
  Code,
  ShieldCheck,
  GitBranch,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Check,
  Layers
} from 'lucide-react';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
// import { EVIDENCE_TYPES, REASONING_RESULTS } from '../../data/graphRAGEvidence'; // Unused

const TYPE_CONFIG = {
  adr: {
    label: 'Architecture Decision Record',
    color: 'blue',
    icon: FileText,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400'
  },
  source: {
    label: 'Source Code',
    color: 'amber',
    icon: Code,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400'
  },
  policy: {
    label: 'OPA Policy',
    color: 'purple',
    icon: ShieldCheck,
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400'
  },
  graph: {
    label: 'Graph Analysis',
    color: 'emerald',
    icon: GitBranch,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400'
  },
  pr: {
    label: 'Pull Request',
    color: 'slate',
    icon: GitPullRequest,
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-400'
  }
};

const SEVERITY_CONFIG = {
  critical: { color: 'red', icon: AlertTriangle, label: 'Critical' },
  high: { color: 'orange', icon: AlertTriangle, label: 'High' },
  medium: { color: 'yellow', icon: Info, label: 'Medium' },
  low: { color: 'blue', icon: CheckCircle, label: 'Low' }
};

export const EvidenceModal = ({ isOpen, onClose, result, evidenceItems }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const severity = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.medium;
  const SeverityIcon = severity.icon;

  const copyContent = () => {
    const content = selectedEvidence ? selectedEvidence.content : result.analysis;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className={cn(
        "px-6 py-4 border-b flex items-start justify-between",
        "bg-slate-800/50 border-slate-700"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            severity.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
              severity.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                severity.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
          )}>
            <SeverityIcon size={20} className={cn(
              severity.color === 'red' ? 'text-red-400' :
                severity.color === 'orange' ? 'text-orange-400' :
                  severity.color === 'yellow' ? 'text-yellow-400' :
                    'text-blue-400'
            )} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">GraphRAG Analysis Result</h3>
            <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{result.query}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                severity.color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  severity.color === 'orange' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                    severity.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              )}>
                {severity.label} Severity
              </span>
              <span className="text-[10px] text-slate-500">
                {evidenceItems.length} Evidence Items
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-800/30">
        <TabButton active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSelectedEvidence(null); }}>
          Analysis Overview
        </TabButton>
        <TabButton active={activeTab === 'evidence'} onClick={() => { setActiveTab('evidence'); }}>
          Evidence Trail ({evidenceItems.length})
        </TabButton>
        <TabButton active={activeTab === 'services'} onClick={() => { setActiveTab('services'); setSelectedEvidence(null); }}>
          Affected Services
        </TabButton>
      </div>

      <ModalContent className="flex-1 overflow-hidden p-0">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Summary Card */}
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Summary</h4>
              <p className="text-sm text-slate-200">{result.summary}</p>
            </div>

            {/* Analysis */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Detailed Analysis</h4>
                <button
                  onClick={copyContent}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-400 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {result.analysis}
                </pre>
              </div>
            </div>

            {/* Key Evidence Preview */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Key Evidence</h4>
              <div className="grid grid-cols-2 gap-3">
                {evidenceItems.slice(0, 4).map(item => (
                  <EvidencePreviewCard
                    key={item.id}
                    item={item}
                    onClick={() => { setSelectedEvidence(item); setActiveTab('evidence'); }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="flex h-full">
            {/* Evidence List Sidebar */}
            <div className="w-72 border-r border-slate-700 bg-slate-800/20 overflow-y-auto">
              <div className="p-3 space-y-2">
                {evidenceItems.map((item, index) => {
                  const config = TYPE_CONFIG[item.type];
                  const Icon = config.icon;
                  const isSelected = selectedEvidence?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedEvidence(item)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all",
                        isSelected
                          ? cn("bg-slate-700/50", config.borderColor)
                          : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon size={14} className={config.textColor} />
                        <span className={cn("text-[10px] font-bold uppercase", config.textColor)}>
                          {config.label}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-500">#{index + 1}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.source}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence Detail */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedEvidence ? (
                <EvidenceDetail
                  evidence={selectedEvidence}
                  onCopy={() => copyContent()}
                  copied={copied}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                  <Layers size={48} className="mb-4 opacity-50" />
                  <p className="text-sm">Select an evidence item to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Affected Services</h4>
            <div className="grid grid-cols-2 gap-4">
              {result.services.map((service, i) => (
                <ServiceCard key={service} name={service} index={i} />
              ))}
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter className="border-t border-slate-700">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers size={14} />
            <span>GraphRAG Engine v2.1 • Confidence: {(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink size={16} />
              View in Policy
            </button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-3 text-sm font-medium transition-colors border-b-2",
      active
        ? "text-blue-400 border-blue-500"
        : "text-slate-400 border-transparent hover:text-slate-200"
    )}
  >
    {children}
  </button>
);

const EvidencePreviewCard = ({ item, onClick }) => {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="p-3 bg-slate-800/30 border border-slate-700 hover:border-slate-600 rounded-xl text-left transition-all hover:bg-slate-800/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={config.textColor} />
        <span className={cn("text-[10px] font-bold uppercase", config.textColor)}>{item.label}</span>
      </div>
      <p className="text-xs text-slate-300 truncate">{item.title}</p>
    </button>
  );
};

const EvidenceDetail = ({ evidence, onCopy, copied }) => {
  const config = TYPE_CONFIG[evidence.type];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", config.bgColor, config.borderColor)}>
            <Icon size={20} className={config.textColor} />
          </div>
          <div>
            <h3 className="font-bold text-slate-200">{evidence.title}</h3>
            <p className="text-xs text-slate-500">{evidence.source}</p>
          </div>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-400 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400">{evidence.description}</p>

      {/* Content */}
      <div className="relative">
        <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 rounded-bl-lg text-[10px] text-slate-500 font-mono">
          {evidence.language || 'text'}
        </div>
        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
          <code className="text-sm text-slate-300 font-mono whitespace-pre">
            {evidence.content}
          </code>
        </pre>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
        <div>
          <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
          <p className="text-sm font-medium text-slate-300">{(evidence.confidence * 100).toFixed(1)}%</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-500 uppercase">Type</span>
          <p className="text-sm font-medium text-slate-300">{config.label}</p>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ name, index }) => (
  <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl flex items-center gap-3">
    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-mono text-sm font-bold">
      {String.fromCharCode(65 + index)}
    </div>
    <div>
      <h5 className="text-sm font-medium text-slate-200">{name}</h5>
      <p className="text-[10px] text-slate-500">Service Node</p>
    </div>
  </div>
);
