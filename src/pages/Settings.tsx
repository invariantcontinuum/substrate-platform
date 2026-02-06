/**
 * Settings Page
 * Comprehensive configuration for the Structural Integrity Platform
 */

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Key,
  Globe,
  Database,
  Cpu,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Shield,
  Layout,
  Bell,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';
import { api } from '@/api';

// Settings sections
interface LLMSettings {
  provider: 'openai' | 'anthropic' | 'azure' | 'ollama' | 'custom';
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

interface APISettings {
  baseUrl: string;
  timeout: number;
  version: string;
  enableMock: boolean;
  mockDelay: number;
}

interface GraphSettings {
  defaultLayout: 'forceatlas2' | 'dagre' | 'circle' | 'grid';
  maxNodes: number;
  enableWebGL: boolean;
  nodeSize: number;
  edgeWidth: number;
}

interface FeatureFlags {
  websocket: boolean;
  graphDiff: boolean;
  policyEditor: boolean;
  ragSearch: boolean;
  driftRemediation: boolean;
}

interface ConnectorSettings {
  github: boolean;
  jira: boolean;
  confluence: boolean;
  slack: boolean;
  syncInterval: number;
}

export const Settings: React.FC = () => {
  const addLog = useAppStore((state) => state.addLog);
  const [activeTab, setActiveTab] = useState<'general' | 'llm' | 'api' | 'graph' | 'connectors'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  // Settings state
  const [llmSettings, setLlmSettings] = useState<LLMSettings>({
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'codellama:13b',
    temperature: 0.3,
    maxTokens: 2048,
    apiKey: '',
  });

  const [apiSettings, setApiSettings] = useState<APISettings>({
    baseUrl: '/api',
    timeout: 30000,
    version: 'v1',
    enableMock: true,
    mockDelay: 500,
  });

  const [graphSettings, setGraphSettings] = useState<GraphSettings>({
    defaultLayout: 'dagre',
    maxNodes: 1000,
    enableWebGL: true,
    nodeSize: 8,
    edgeWidth: 1,
  });

  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    websocket: false,
    graphDiff: true,
    policyEditor: true,
    ragSearch: true,
    driftRemediation: true,
  });

  const [connectorSettings, setConnectorSettings] = useState<ConnectorSettings>({
    github: true,
    jira: true,
    confluence: true,
    slack: false,
    syncInterval: 15,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sip-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.llm) setLlmSettings(parsed.llm);
        if (parsed.api) setApiSettings(parsed.api);
        if (parsed.graph) setGraphSettings(parsed.graph);
        if (parsed.features) setFeatureFlags(parsed.features);
        if (parsed.connectors) setConnectorSettings(parsed.connectors);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Save to localStorage
    localStorage.setItem('sip-settings', JSON.stringify({
      llm: llmSettings,
      api: apiSettings,
      graph: graphSettings,
      features: featureFlags,
      connectors: connectorSettings,
    }));

    setIsSaving(false);
    setSaveSuccess(true);

    addLog({
      time: new Date().toLocaleTimeString(),
      msg: 'Settings saved successfully',
      level: 'info',
    });

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.removeItem('sip-settings');
      window.location.reload();
    }
  };

  const testConnection = async (type: string) => {
    setTestStatus(prev => ({ ...prev, [type]: 'testing' }));

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.3; // 70% success rate for demo
    setTestStatus(prev => ({ ...prev, [type]: success ? 'success' : 'error' }));

    addLog({
      time: new Date().toLocaleTimeString(),
      msg: `${type} connection test ${success ? 'successful' : 'failed'}`,
      level: success ? 'info' : 'error',
    });

    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [type]: 'idle' }));
    }, 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'llm', label: 'LLM / AI', icon: Cpu },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'graph', label: 'Graph', icon: Layout },
    { id: 'connectors', label: 'Connectors', icon: Database },
  ];

  return (
    <div className="p-6 h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-200">
            <SettingsIcon size={24} className="text-blue-400" />
            Settings
            <span className="text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-normal uppercase tracking-widest">
              Configuration
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure platform settings, AI providers, and data sources.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 flex items-center gap-2 transition-all"
          >
            <RotateCcw size={16} />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            )}
          >
            {isSaving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-56 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                activeTab === tab.id
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Section title="Feature Flags" icon={ToggleLeft}>
                <div className="grid grid-cols-2 gap-4">
                  <Toggle
                    label="WebSocket Support"
                    description="Enable real-time updates via WebSocket"
                    checked={featureFlags.websocket}
                    onChange={(v) => setFeatureFlags(prev => ({ ...prev, websocket: v }))}
                  />
                  <Toggle
                    label="Graph Diff Visualization"
                    description="Show differences between graph versions"
                    checked={featureFlags.graphDiff}
                    onChange={(v) => setFeatureFlags(prev => ({ ...prev, graphDiff: v }))}
                  />
                  <Toggle
                    label="Policy Editor"
                    description="Enable in-app policy editing"
                    checked={featureFlags.policyEditor}
                    onChange={(v) => setFeatureFlags(prev => ({ ...prev, policyEditor: v }))}
                  />
                  <Toggle
                    label="RAG Search"
                    description="Enable GraphRAG semantic search"
                    checked={featureFlags.ragSearch}
                    onChange={(v) => setFeatureFlags(prev => ({ ...prev, ragSearch: v }))}
                  />
                  <Toggle
                    label="Drift Remediation"
                    description="Enable auto-remediation suggestions"
                    checked={featureFlags.driftRemediation}
                    onChange={(v) => setFeatureFlags(prev => ({ ...prev, driftRemediation: v }))}
                  />
                </div>
              </Section>

              <Section title="Notifications" icon={Bell}>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-200">Drift Alerts</span>
                      <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300">
                        <option>Immediate</option>
                        <option>Daily Digest</option>
                        <option>Weekly Summary</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500">Get notified when architectural drift is detected</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-200">Policy Violations</span>
                      <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300">
                        <option>Immediate</option>
                        <option>Daily Digest</option>
                        <option>Weekly Summary</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500">Get notified when policies are violated</p>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* LLM Settings */}
          {activeTab === 'llm' && (
            <div className="space-y-6">
              <Section title="LLM Provider" icon={Cpu}>
                <div className="grid grid-cols-2 gap-4">
                  {(['ollama', 'openai', 'anthropic', 'azure', 'custom'] as const).map((provider) => (
                    <button
                      key={provider}
                      onClick={() => setLlmSettings(prev => ({ ...prev, provider }))}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all",
                        llmSettings.provider === provider
                          ? "bg-blue-500/10 border-blue-500/40"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "font-medium",
                          llmSettings.provider === provider ? "text-blue-400" : "text-slate-300"
                        )}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </span>
                        {llmSettings.provider === provider && <Check size={16} className="text-blue-400" />}
                      </div>
                      <p className="text-xs text-slate-500">
                        {provider === 'ollama' && 'Local LLM inference'}
                        {provider === 'openai' && 'OpenAI GPT models'}
                        {provider === 'anthropic' && 'Claude models'}
                        {provider === 'azure' && 'Azure OpenAI Service'}
                        {provider === 'custom' && 'Custom OpenAI-compatible endpoint'}
                      </p>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Connection" icon={Globe}>
                <div className="space-y-4">
                  <Input
                    label="Base URL"
                    value={llmSettings.baseUrl}
                    onChange={(v) => setLlmSettings(prev => ({ ...prev, baseUrl: v }))}
                    placeholder="http://localhost:11434"
                    action={
                      <TestButton
                        status={testStatus['llm'] || 'idle'}
                        onClick={() => testConnection('llm')}
                      />
                    }
                  />
                  <Input
                    label="API Key"
                    type="password"
                    value={llmSettings.apiKey}
                    onChange={(v) => setLlmSettings(prev => ({ ...prev, apiKey: v }))}
                    placeholder="sk-..."
                    icon={<Key size={16} />}
                  />
                  <Input
                    label="Model"
                    value={llmSettings.model}
                    onChange={(v) => setLlmSettings(prev => ({ ...prev, model: v }))}
                    placeholder="codellama:13b"
                  />
                </div>
              </Section>

              <Section title="Generation Parameters" icon={SettingsIcon}>
                <div className="space-y-4">
                  <Slider
                    label="Temperature"
                    value={llmSettings.temperature}
                    onChange={(v) => setLlmSettings(prev => ({ ...prev, temperature: v }))}
                    min={0}
                    max={2}
                    step={0.1}
                    description="Higher values make output more random"
                  />
                  <Slider
                    label="Max Tokens"
                    value={llmSettings.maxTokens}
                    onChange={(v) => setLlmSettings(prev => ({ ...prev, maxTokens: v }))}
                    min={256}
                    max={4096}
                    step={256}
                    description="Maximum tokens to generate"
                  />
                </div>
              </Section>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <Section title="API Configuration" icon={Globe}>
                <div className="space-y-4">
                  <Input
                    label="Base URL"
                    value={apiSettings.baseUrl}
                    onChange={(v) => setApiSettings(prev => ({ ...prev, baseUrl: v }))}
                    placeholder="/api"
                  />
                  <Input
                    label="API Version"
                    value={apiSettings.version}
                    onChange={(v) => setApiSettings(prev => ({ ...prev, version: v }))}
                    placeholder="v1"
                  />
                  <Slider
                    label="Timeout (ms)"
                    value={apiSettings.timeout}
                    onChange={(v) => setApiSettings(prev => ({ ...prev, timeout: v }))}
                    min={5000}
                    max={60000}
                    step={5000}
                    description="Request timeout in milliseconds"
                  />
                </div>
              </Section>

              <Section title="Mock API" icon={Shield}>
                <div className="space-y-4">
                  <Toggle
                    label="Enable Mock API"
                    description="Use mock data instead of real backend"
                    checked={apiSettings.enableMock}
                    onChange={(v) => setApiSettings(prev => ({ ...prev, enableMock: v }))}
                  />
                  {apiSettings.enableMock && (
                    <Slider
                      label="Mock Delay (ms)"
                      value={apiSettings.mockDelay}
                      onChange={(v) => setApiSettings(prev => ({ ...prev, mockDelay: v }))}
                      min={0}
                      max={2000}
                      step={100}
                      description="Simulated network delay"
                    />
                  )}
                </div>
              </Section>
            </div>
          )}

          {/* Graph Settings */}
          {activeTab === 'graph' && (
            <div className="space-y-6">
              <Section title="Visualization" icon={Layout}>
                <div className="space-y-4">
                  <Select
                    label="Default Layout"
                    value={graphSettings.defaultLayout}
                    onChange={(v) => setGraphSettings(prev => ({ ...prev, defaultLayout: v as any }))}
                    options={[
                      { value: 'forceatlas2', label: 'Force Atlas 2' },
                      { value: 'dagre', label: 'Dagre (Hierarchical)' },
                      { value: 'circle', label: 'Circle' },
                      { value: 'grid', label: 'Grid' },
                    ]}
                  />
                  <Slider
                    label="Max Nodes"
                    value={graphSettings.maxNodes}
                    onChange={(v) => setGraphSettings(prev => ({ ...prev, maxNodes: v }))}
                    min={100}
                    max={5000}
                    step={100}
                    description="Maximum nodes to render before simplification"
                  />
                  <Toggle
                    label="Enable WebGL"
                    description="Use WebGL acceleration for large graphs"
                    checked={graphSettings.enableWebGL}
                    onChange={(v) => setGraphSettings(prev => ({ ...prev, enableWebGL: v }))}
                  />
                </div>
              </Section>

              <Section title="Appearance" icon={SettingsIcon}>
                <div className="space-y-4">
                  <Slider
                    label="Node Size"
                    value={graphSettings.nodeSize}
                    onChange={(v) => setGraphSettings(prev => ({ ...prev, nodeSize: v }))}
                    min={4}
                    max={20}
                    step={1}
                  />
                  <Slider
                    label="Edge Width"
                    value={graphSettings.edgeWidth}
                    onChange={(v) => setGraphSettings(prev => ({ ...prev, edgeWidth: v }))}
                    min={1}
                    max={5}
                    step={0.5}
                  />
                </div>
              </Section>
            </div>
          )}

          {/* Connector Settings */}
          {activeTab === 'connectors' && (
            <div className="space-y-6">
              <Section title="Data Sources" icon={Database}>
                <div className="space-y-3">
                  <ConnectorCard
                    name="GitHub"
                    description="Repository data, PRs, and issues"
                    enabled={connectorSettings.github}
                    onToggle={(v) => setConnectorSettings(prev => ({ ...prev, github: v }))}
                    status={testStatus['github'] || 'idle'}
                    onTest={() => testConnection('github')}
                  />
                  <ConnectorCard
                    name="Jira"
                    description="Tickets, epics, and sprints"
                    enabled={connectorSettings.jira}
                    onToggle={(v) => setConnectorSettings(prev => ({ ...prev, jira: v }))}
                    status={testStatus['jira'] || 'idle'}
                    onTest={() => testConnection('jira')}
                  />
                  <ConnectorCard
                    name="Confluence"
                    description="Documentation and knowledge base"
                    enabled={connectorSettings.confluence}
                    onToggle={(v) => setConnectorSettings(prev => ({ ...prev, confluence: v }))}
                    status={testStatus['confluence'] || 'idle'}
                    onTest={() => testConnection('confluence')}
                  />
                  <ConnectorCard
                    name="Slack"
                    description="Team communications and decisions"
                    enabled={connectorSettings.slack}
                    onToggle={(v) => setConnectorSettings(prev => ({ ...prev, slack: v }))}
                    status={testStatus['slack'] || 'idle'}
                    onTest={() => testConnection('slack')}
                  />
                </div>
              </Section>

              <Section title="Sync Schedule" icon={Clock}>
                <div className="space-y-4">
                  <Slider
                    label="Sync Interval (minutes)"
                    value={connectorSettings.syncInterval}
                    onChange={(v) => setConnectorSettings(prev => ({ ...prev, syncInterval: v }))}
                    min={5}
                    max={60}
                    step={5}
                    description="How often to sync data from sources"
                  />
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components

const Section: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className="text-blue-400" />
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ label, value, onChange, type = 'text', placeholder, icon, action }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">{label}</label>
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors",
            icon && "pl-10"
          )}
        />
      </div>
      {action}
    </div>
  </div>
);

const Select: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Slider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  description?: string;
}> = ({ label, value, onChange, min, max, step, description }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase">{label}</label>
      <span className="text-xs font-mono text-slate-300">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
    {description && <p className="text-[10px] text-slate-500 mt-1">{description}</p>}
  </div>
);

const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
    <div>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-slate-700"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  </div>
);

const TestButton: React.FC<{
  status: 'idle' | 'testing' | 'success' | 'error';
  onClick: () => void;
}> = ({ status, onClick }) => {
  const icons = {
    idle: <Globe size={16} />,
    testing: <RefreshCw size={16} className="animate-spin" />,
    success: <Check size={16} />,
    error: <X size={16} />,
  };

  const colors = {
    idle: 'bg-slate-800 text-slate-400 hover:bg-slate-700',
    testing: 'bg-blue-600/20 text-blue-400',
    success: 'bg-emerald-600/20 text-emerald-400',
    error: 'bg-red-600/20 text-red-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={status === 'testing'}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
        colors[status]
      )}
    >
      {icons[status]}
      {status === 'idle' ? 'Test' : status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

const ConnectorCard: React.FC<{
  name: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  status: 'idle' | 'testing' | 'success' | 'error';
  onTest: () => void;
}> = ({ name, description, enabled, onToggle, status, onTest }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        enabled ? "bg-blue-500/10" : "bg-slate-800"
      )}>
        <Database size={20} className={enabled ? "text-blue-400" : "text-slate-500"} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-200">{name}</h4>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onTest}
        disabled={!enabled || status === 'testing'}
        className={cn(
          "px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all",
          !enabled && "opacity-50 cursor-not-allowed",
          status === 'success' && "text-emerald-400 bg-emerald-500/10",
          status === 'error' && "text-red-400 bg-red-500/10",
          status === 'idle' && enabled && "text-slate-400 hover:bg-slate-700",
          status === 'testing' && "text-blue-400"
        )}
      >
        {status === 'testing' ? <RefreshCw size={14} className="animate-spin" /> :
          status === 'success' ? <Check size={14} /> :
            status === 'error' ? <X size={14} /> :
              <Globe size={14} />}
        {status === 'idle' ? 'Test' : status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
      <button
        onClick={() => onToggle(!enabled)}
        className={cn(
          "px-3 py-1.5 rounded text-xs font-medium transition-all",
          enabled
            ? "bg-blue-600 text-white"
            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
        )}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  </div>
);

export default Settings;
