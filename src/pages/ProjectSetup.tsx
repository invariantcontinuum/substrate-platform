/**
 * Project Setup Wizard
 * Guided flow for configuring new projects
 * Following DRY, KISS, and SOLID principles
 */

import React, { useState, useEffect } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Plug,
  Shield,
  Settings,
  Loader2,
  Github,
  Gitlab,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Zap,
  Database,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores';
import { projectsService, connectorMarketplaceService, policiesService } from '@/api/services';
import type { ConnectorDefinition, PolicyTemplate } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ProjectSetupProps {
  projectId: string;
  projectName: string;
  onSetupComplete?: () => void;
}

type SetupStep = 'connectors' | 'policies' | 'review';

interface SelectedConnector {
  definitionId: string;
  name: string;
  config: Record<string, string>;
}

// ============================================================================
// Step Indicator
// ============================================================================

const StepIndicator: React.FC<{
  steps: { id: SetupStep; label: string; icon: React.ElementType }[];
  currentStep: SetupStep;
}> = ({ steps, currentStep }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        
        return (
          <React.Fragment key={step.id}>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              isActive && "bg-blue-500/10 text-blue-400",
              isCompleted && "text-emerald-400",
              !isActive && !isCompleted && "text-slate-500"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isActive && "bg-blue-500/20",
                isCompleted && "bg-emerald-500/20",
                !isActive && !isCompleted && "bg-slate-800"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:block">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================================
// Connector Selection Step
// ============================================================================

const ConnectorStep: React.FC<{
  selectedConnectors: SelectedConnector[];
  onToggleConnector: (connector: ConnectorDefinition) => void;
}> = ({ selectedConnectors, onToggleConnector }) => {
  const [connectors, setConnectors] = useState<ConnectorDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        const response = await connectorMarketplaceService.getAvailable();
        setConnectors(response.data || []);
      } catch (error) {
        console.error('Failed to fetch connectors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConnectors();
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case 'github': return Github;
      case 'gitlab': return Gitlab;
      case 'confluence': return FileText;
      case 'slack': return MessageSquare;
      default: return Database;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Data Sources</h3>
        <p className="text-slate-400">
          Select the tools and platforms you want Substrate to analyze
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {connectors.map((connector) => {
          const Icon = getIcon(connector.id);
          const isSelected = selectedConnectors.some(c => c.definitionId === connector.id);
          
          return (
            <button
              key={connector.id}
              onClick={() => onToggleConnector(connector)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-blue-500/20" : "bg-slate-800"
                )}>
                  <Icon className={cn("w-6 h-6", isSelected ? "text-blue-400" : "text-slate-400")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("font-medium", isSelected ? "text-blue-400" : "text-white")}>
                      {connector.name}
                    </h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{connector.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {connector.capabilities
                      ?.filter(c => c.type === 'entities')
                      .flatMap(c => c.entityTypes)
                      .slice(0, 3)
                      .map((type) => (
                        <span key={type} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">
                          {type}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedConnectors.length === 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-400 font-medium">No connectors selected</p>
            <p className="text-sm text-amber-400/70 mt-1">
              Select at least one data source to continue. You can always add more later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Policy Selection Step
// ============================================================================

const PolicyStep: React.FC<{
  selectedPolicies: string[];
  onTogglePolicy: (policyId: string) => void;
}> = ({ selectedPolicies, onTogglePolicy }) => {
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await policiesService.getTemplates();
        setTemplates(response.data || []);
      } catch (error) {
        console.error('Failed to fetch policy templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Configure Governance Policies</h3>
        <p className="text-slate-400">
          Select architectural policies to enforce on your codebase
        </p>
      </div>

      <div className="space-y-4">
        {templates.map((template) => {
          const isSelected = selectedPolicies.includes(template.id);
          
          return (
            <button
              key={template.id}
              onClick={() => onTogglePolicy(template.id)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isSelected ? "bg-blue-500/20" : "bg-slate-800"
                )}>
                  <Shield className={cn("w-5 h-5", isSelected ? "text-blue-400" : "text-slate-400")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("font-medium", isSelected ? "text-blue-400" : "text-white")}>
                      {template.name}
                    </h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">
                    {template.category}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// Review Step
// ============================================================================

const ReviewStep: React.FC<{
  selectedConnectors: SelectedConnector[];
  selectedPolicies: string[];
  isCompleting: boolean;
}> = ({ selectedConnectors, selectedPolicies, isCompleting }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Review Your Setup</h3>
        <p className="text-slate-400">
          Here's what will be configured for your project
        </p>
      </div>

      <div className="space-y-4">
        {/* Connectors Summary */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Plug className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-white">Data Connectors</h4>
            <span className="ml-auto text-sm text-slate-500">
              {selectedConnectors.length} selected
            </span>
          </div>
          {selectedConnectors.length > 0 ? (
            <div className="space-y-2">
              {selectedConnectors.map((connector) => (
                <div key={connector.definitionId} className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {connector.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No connectors selected</p>
          )}
        </div>

        {/* Policies Summary */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-white">Governance Policies</h4>
            <span className="ml-auto text-sm text-slate-500">
              {selectedPolicies.length} selected
            </span>
          </div>
          {selectedPolicies.length > 0 ? (
            <div className="space-y-2">
              {selectedPolicies.map((policyId) => (
                <div key={policyId} className="flex items-center gap-2 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {policyId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No policies selected</p>
          )}
        </div>
      </div>

      {isCompleting && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-sm text-blue-400">Completing setup...</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Project Setup Component
// ============================================================================

export const ProjectSetup: React.FC<ProjectSetupProps> = ({ projectId, projectName, onSetupComplete }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('connectors');
  const [selectedConnectors, setSelectedConnectors] = useState<SelectedConnector[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  const steps: { id: SetupStep; label: string; icon: React.ElementType }[] = [
    { id: 'connectors', label: 'Connectors', icon: Plug },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'review', label: 'Review', icon: Settings },
  ];

  const handleToggleConnector = (connector: ConnectorDefinition) => {
    setSelectedConnectors(prev => {
      const exists = prev.find(c => c.definitionId === connector.id);
      if (exists) {
        return prev.filter(c => c.definitionId !== connector.id);
      }
      return [...prev, {
        definitionId: connector.id,
        name: connector.name,
        config: {},
      }];
    });
  };

  const handleTogglePolicy = (policyId: string) => {
    setSelectedPolicies(prev => {
      if (prev.includes(policyId)) {
        return prev.filter(id => id !== policyId);
      }
      return [...prev, policyId];
    });
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep.id);
      }
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Activate the project
      const response = await projectsService.updateProject(projectId, {
        name: projectName,
      });
      
      // Update status locally in the store
      setCurrentProject({ ...response.data, status: 'active' });
      onSetupComplete?.();
    } catch (error) {
      console.error('Failed to complete setup:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'connectors':
        return selectedConnectors.length > 0;
      case 'policies':
        return true; // Optional
      case 'review':
        return !isCompleting;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Project Setup</h1>
            <p className="text-sm text-slate-400">
              Configure {projectName} to start tracking your architecture
            </p>
          </div>
          <button
            onClick={() => onSetupComplete?.()}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="mt-8">
            {currentStep === 'connectors' && (
              <ConnectorStep
                selectedConnectors={selectedConnectors}
                onToggleConnector={handleToggleConnector}
              />
            )}
            {currentStep === 'policies' && (
              <PolicyStep
                selectedPolicies={selectedPolicies}
                onTogglePolicy={handleTogglePolicy}
              />
            )}
            {currentStep === 'review' && (
              <ReviewStep
                selectedConnectors={selectedConnectors}
                selectedPolicies={selectedPolicies}
                isCompleting={isCompleting}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={handleBack}
            disabled={currentStep === 'connectors'}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              currentStep === 'connectors'
                ? "text-slate-600 cursor-not-allowed"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 'review' ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors",
                  !canProceed() && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors",
                  !canProceed() && "opacity-50 cursor-not-allowed"
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetup;
