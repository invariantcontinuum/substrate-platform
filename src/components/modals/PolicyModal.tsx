import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileEdit,
  Ban,
  X,
  Code,
  Save,
  Trash2,
  Tag,
  User,
  Calendar,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  Enforced: { color: 'emerald', icon: ShieldCheck, bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', textColor: 'text-emerald-400' },
  Warning: { color: 'amber', icon: AlertTriangle, bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400' },
  Draft: { color: 'slate', icon: FileEdit, bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', textColor: 'text-slate-400' },
  Disabled: { color: 'gray', icon: Ban, bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30', textColor: 'text-gray-400' }
};

const SEVERITY_COLORS = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Low: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
};

const ENFORCEMENT_MODES = [
  { value: 'Strict', label: 'Strict', description: 'Block all violations' },
  { value: 'Warn', label: 'Warning', description: 'Log warnings only' },
  { value: 'DryRun', label: 'Dry Run', description: 'Audit mode, no action' }
];

// Default empty policy template
const DEFAULT_POLICY = {
  name: '',
  description: '',
  package: 'substrate.custom',
  status: 'Draft',
  severity: 'Medium',
  rego: `package substrate.custom

import future.keywords.if

# Add your policy rules here
deny contains msg if {
    # Your condition
    msg := "Violation detected"
}`,
  metadata: {
    author: 'Current User',
    tags: []
  },
  enforcement: {
    mode: 'DryRun',
    scope: ['staging'],
    autoRemediate: false
  }
};

export const PolicyModal = ({ isOpen, onClose, policy, onSave, onDelete, mode = 'edit' }) => {
  const [formData, setFormData] = useState<any>(DEFAULT_POLICY);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const isCreate = mode === 'create';
  // const isView = mode === 'view'; // Unused

  useEffect(() => {
    if (policy) {
      setFormData({ ...DEFAULT_POLICY, ...policy });
    } else {
      setFormData(DEFAULT_POLICY);
    }
    setErrors({});
    setActiveTab('general');
    setShowDeleteConfirm(false);
  }, [policy, isOpen]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Policy name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.package.trim()) newErrors.package = 'Package path is required';
    if (!formData.rego.trim()) newErrors.rego = 'Rego policy is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...formData,
      id: policy?.id || `pol-${Date.now()}`,
      rules: countRules(formData.rego),
      metadata: {
        ...formData.metadata,
        created: policy?.metadata?.created || new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0]
      }
    });
    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(policy.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const copyRego = () => {
    navigator.clipboard.writeText(formData.rego);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const countRules = (rego: any) => {
    const matches = rego.match(/deny\s+contains/g);
    return matches ? matches.length : 0;
  };

  const statusConfig = STATUS_CONFIG[formData.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Draft;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[90vh] flex flex-col">
      <ModalHeader
        icon={<Code size={16} className={isCreate ? 'text-blue-400' : statusConfig.textColor} />}
        iconClassName={isCreate ? 'bg-blue-500/20' : statusConfig.bgColor}
        title={isCreate ? 'Create New Policy' : formData.name}
        subtitle={isCreate ? 'Define a new OPA Rego policy' : `${formData.package} • ${formData.rules} rules`}
        onClose={onClose}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-800/30">
        {['general', 'rego', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2",
              activeTab === tab
                ? "text-blue-400 border-blue-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <ModalContent className="flex-1 overflow-y-auto">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Name & Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Policy Name"
                value={formData.name}
                onChange={v => setFormData({ ...formData, name: v })}
                error={errors.name}
                placeholder="e.g., API Gateway Enforcement"
                icon={ShieldCheck}
              />

              <SelectField
                label="Status"
                value={formData.status}
                onChange={v => setFormData({ ...formData, status: v })}
                options={Object.keys(STATUS_CONFIG)}
                renderOption={opt => (
                  <div className="flex items-center gap-2">
                    {React.createElement(STATUS_CONFIG[opt].icon, { size: 14, className: STATUS_CONFIG[opt].textColor })}
                    <span>{opt}</span>
                  </div>
                )}
              />
            </div>

            {/* Description */}
            <InputField
              label="Description"
              value={formData.description}
              onChange={v => setFormData({ ...formData, description: v })}
              error={errors.description}
              placeholder="What does this policy enforce?"
              multiline
              rows={2}
            />

            {/* Package & Severity Row */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Package Path"
                value={formData.package}
                onChange={v => setFormData({ ...formData, package: v })}
                error={errors.package}
                placeholder="substrate.mypolicy"
                icon={Code}
              />

              <SelectField
                label="Severity"
                value={formData.severity}
                onChange={v => setFormData({ ...formData, severity: v })}
                options={['Critical', 'High', 'Medium', 'Low']}
                renderOption={opt => (
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", SEVERITY_COLORS[opt])}>
                    {opt}
                  </span>
                )}
              />
            </div>

            {/* Tags */}
            <TagInput
              label="Tags"
              tags={formData.metadata.tags}
              onChange={tags => setFormData({
                ...formData,
                metadata: { ...formData.metadata, tags }
              })}
            />

            {/* Metadata Display (view only) */}
            {!isCreate && (
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Metadata</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <MetaItem icon={User} label="Author" value={formData.metadata.author} />
                  <MetaItem icon={Calendar} label="Created" value={formData.metadata.created} />
                  <MetaItem icon={Calendar} label="Updated" value={formData.metadata.updated} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rego' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-200">Rego Policy Code</h3>
                <p className="text-xs text-slate-500 mt-0.5">Define your policy using OPA Rego language</p>
              </div>
              <button
                onClick={copyRego}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={formData.rego}
                onChange={e => setFormData({ ...formData, rego: e.target.value })}
                className={cn(
                  "w-full h-96 bg-slate-950 border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors",
                  errors.rego ? "border-red-500/50" : "border-slate-700"
                )}
                spellCheck={false}
              />
              {errors.rego && (
                <p className="mt-2 text-xs text-red-400">{errors.rego}</p>
              )}
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Rego Quick Reference</h4>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <p><code className="text-slate-300">deny contains msg if {'{...}'}</code> — Define denial rule</p>
                <p><code className="text-slate-300">import future.keywords.if</code> — Enable modern syntax</p>
                <p><code className="text-slate-300">input.request.service</code> — Access input data</p>
                <p><code className="text-slate-300">data.allowed_services</code> — Access data documents</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Enforcement Mode */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Enforcement Mode</label>
              <div className="space-y-2">
                {ENFORCEMENT_MODES.map(mode => (
                  <label
                    key={mode.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                      formData.enforcement.mode === mode.value
                        ? "bg-blue-500/10 border-blue-500/40"
                        : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <input
                      type="radio"
                      name="enforcement"
                      value={mode.value}
                      checked={formData.enforcement.mode === mode.value}
                      onChange={e => setFormData({
                        ...formData,
                        enforcement: { ...formData.enforcement, mode: e.target.value }
                      })}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200">{mode.label}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{mode.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Enforcement Scope</label>
              <div className="flex flex-wrap gap-2">
                {['production', 'staging', 'development', 'all'].map(scope => (
                  <button
                    key={scope}
                    onClick={() => {
                      const scopes = formData.enforcement.scope.includes(scope)
                        ? formData.enforcement.scope.filter(s => s !== scope)
                        : [...formData.enforcement.scope, scope];
                      setFormData({
                        ...formData,
                        enforcement: { ...formData.enforcement, scope: scopes }
                      });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                      formData.enforcement.scope.includes(scope)
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                    )}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-remediate */}
            <label className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700 rounded-xl cursor-pointer hover:border-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={formData.enforcement.autoRemediate}
                onChange={e => setFormData({
                  ...formData,
                  enforcement: { ...formData.enforcement, autoRemediate: e.target.checked }
                })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-200">Auto-remediate violations</span>
                <p className="text-xs text-slate-500 mt-0.5">Automatically fix violations where possible</p>
              </div>
            </label>
          </div>
        )}
      </ModalContent>

      <ModalFooter className="border-t border-slate-700">
        <div className="flex items-center justify-between w-full">
          <div>
            {!isCreate && (
              <button
                onClick={handleDelete}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  showDeleteConfirm
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                )}
              >
                <Trash2 size={16} />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} />
              {isCreate ? 'Create Policy' : 'Save Changes'}
            </button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

// Form Components
const InputField = ({ label, value, onChange, error, placeholder, icon: Icon, multiline, rows = 1 }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "w-full bg-slate-800/50 border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none",
            error ? "border-red-500/50" : "border-slate-700",
            Icon && "pl-10"
          )}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-slate-800/50 border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors",
            error ? "border-red-500/50" : "border-slate-700",
            Icon && "pl-10"
          )}
        />
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, renderOption: _renderOption }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
      >
        {options.map((opt: any) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  </div>
);

const TagInput = ({ label, tags, onChange }: any) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput('');
    }
  };

  const removeTag = (tag: any) => {
    onChange(tags.filter((t: any) => t !== tag));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 bg-slate-800/50 border border-slate-700 rounded-lg">
        {tags.map((tag: any) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
          >
            <Tag size={12} />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-400 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
        />
      </div>
    </div>
  );
};

const MetaItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-2">
    <Icon size={14} className="text-slate-500" />
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-slate-300">{value}</p>
    </div>
  </div>
);
