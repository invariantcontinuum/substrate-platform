import { Search, Layers, Box, Code, Workflow } from 'lucide-react';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalActionButton, ModalInfoBox } from '@/components/ui/Modal';
import { useLensConfig, useAnalysisActions } from '@/hooks';
import { LensType } from '@/types';

const ICON_COMPONENTS = { Layers, Box, Code, Workflow };

const TITLE_COLOR_CLASSES: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400'
};

interface AnalyzeSubgraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  lensType: LensType;
}

export const AnalyzeSubgraphModal = ({ isOpen, onClose, lensType }: AnalyzeSubgraphModalProps) => {
  const { data: lensConfig } = useLensConfig();
  const { data: analysisActions } = useAnalysisActions();

  const config = lensConfig?.[lensType];
  const actions = analysisActions?.[lensType] || [];
  const isReality = lensType === 'reality';

  if (!config?.metrics) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        icon={<Search size={16} className={isReality ? 'text-blue-400' : 'text-purple-400'} />}
        iconClassName={isReality ? 'bg-blue-500/20' : 'bg-purple-500/20'}
        title="Subgraph Analysis"
        subtitle={`${config.label} Lens — ${config.metrics.entities} Entities Selected`}
        onClose={onClose}
      />

      <ModalContent>
        <ModalInfoBox color={(config.accentColor as 'blue' | 'purple' | 'red' | 'emerald') || 'blue'}>
          <h4 className={`text-xs font-bold uppercase mb-2 ${TITLE_COLOR_CLASSES[config.accentColor]}`}>
            {config.description}
          </h4>
          <p className="text-sm text-slate-300">
            {config.summary} Knowledge {isReality ? 'depth score' : 'coverage'}: {config.metrics.score} ({isReality ? 'High' : 'Good'}).
          </p>
        </ModalInfoBox>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Analysis Actions</h4>
          <div className="space-y-3">
            {actions.map(action => {
              const IconComponent = ICON_COMPONENTS[action.icon as keyof typeof ICON_COMPONENTS];
              return (
                <ModalActionButton
                  key={action.id}
                  icon={IconComponent}
                  label={action.label}
                  description={action.description}
                  color={action.color as 'blue' | 'purple' | 'red' | 'emerald' | 'amber'}
                />
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-slate-800/30 rounded-lg text-center">
            <p className="text-lg font-bold text-slate-200">{config.metrics.entities}</p>
            <p className="text-[10px] text-slate-500 uppercase">Entities</p>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg text-center">
            <p className="text-lg font-bold text-slate-200">{config.metrics.score}</p>
            <p className="text-[10px] text-slate-500 uppercase">{config.metrics.scoreLabel}</p>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg text-center">
            <p className="text-lg font-bold text-slate-200">{config.metrics.subCount}</p>
            <p className="text-[10px] text-slate-500 uppercase">{config.metrics.subLabel}</p>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};
