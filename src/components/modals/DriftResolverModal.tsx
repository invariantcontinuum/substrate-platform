import { AlertTriangle, FileText, GitCompare, CheckCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalActionButton, ModalInfoBox } from '@/components/ui/Modal';
import { useLensConfig, useDriftActions } from '@/hooks';

const ICON_COMPONENTS = { FileText, GitCompare, CheckCircle };

interface DriftResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriftResolverModal = ({ isOpen, onClose }: DriftResolverModalProps) => {
  const { data: lensConfig } = useLensConfig();
  const { data: driftActions } = useDriftActions();

  const driftConfig = lensConfig?.drift;
  const violation = driftConfig?.violation;

  if (!violation || !driftActions) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        icon={<AlertTriangle size={16} className="text-red-400" />}
        iconClassName="bg-red-500/20"
        title="Drift Resolver"
        subtitle={`Violation: ${violation.policy} Dependency Constraint`}
        onClose={onClose}
      />

      <ModalContent>
        <ModalInfoBox color="red">
          <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Issue Summary</h4>
          <p className="text-sm text-slate-300">
            Undocumented dependency detected between <span className="text-blue-400 font-mono">{violation.between[0]}</span> and <span className="text-red-400 font-mono">{violation.between[1]}</span>.
            {violation.description}
          </p>
        </ModalInfoBox>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Resolution Options</h4>
          <div className="space-y-3">
            {driftActions.map(action => {
              const IconComponent = ICON_COMPONENTS[action.icon as keyof typeof ICON_COMPONENTS];
              return (
                <ModalActionButton
                  key={action.id}
                  icon={IconComponent}
                  label={action.label}
                  description={action.description}
                  color={action.color as any}
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
          Cancel
        </button>
      </ModalFooter>
    </Modal>
  );
};
