import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { GatewayStatus } from '@/types';
import { PROCESS_SUGGESTIONS } from '@/utils/statusUtils';

interface ActionStepsProps {
  status: GatewayStatus;
  onStepComplete?: (stepIndex: number) => void;
  completedSteps?: number[];
}

export const ActionSteps: React.FC<ActionStepsProps> = ({
  status,
  onStepComplete,
  completedSteps = [],
}) => {
  const suggestions = PROCESS_SUGGESTIONS[status];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300">{suggestions.title}</h4>
      <div className="space-y-2">
        {suggestions.steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          return (
            <div
              key={index}
              onClick={() => onStepComplete?.(index)}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm ${
                  isCompleted ? 'text-emerald-400 line-through' : 'text-slate-300'
                }`}
              >
                {index + 1}. {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
