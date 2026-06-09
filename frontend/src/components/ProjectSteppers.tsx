import React from 'react';
import { Lightbulb, Search, Code, Rocket, TrendingUp, CheckCircle2 } from 'lucide-react';

export type ProjectStage = 'Ideación' | 'Validación' | 'Prototipo' | 'Incubación' | 'Escalamiento';

interface ProjectSteppersProps {
  currentStep: ProjectStage;
}

const STAGES = [
  { id: 'Ideación', label: 'Ideación', icon: Lightbulb, description: 'Idea' },
  { id: 'Validación', label: 'Validación', icon: Search, description: 'Mercado' },
  { id: 'Prototipo', label: 'Prototipo', icon: Code, description: 'MVP' },
  { id: 'Incubación', label: 'Incubación', icon: Rocket, description: 'Negocio' },
  { id: 'Escalamiento', label: 'Escalamiento', icon: TrendingUp, description: 'Crecimiento' },
] as const;

export const ProjectSteppers: React.FC<ProjectSteppersProps> = ({ currentStep }) => {
  const currentIndex = STAGES.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full relative px-2">
      <div className="flex items-center justify-between w-full relative">
        {/* Background connector track */}
        <div className="absolute left-[10%] right-[10%] top-6 h-2 -translate-y-1/2 bg-gray-200 rounded-full overflow-hidden">
          {/* Active progress connector */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-[#1A365D] transition-all duration-700 ease-out"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          const Icon = isCompleted ? CheckCircle2 : stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group w-1/5">
              <div 
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ease-out
                  ${isCompleted ? 'bg-[#1A365D] border-[#1A365D] text-white shadow-md' : ''}
                  ${isCurrent ? 'bg-white border-[#1A365D] text-[#1A365D] shadow-lg scale-110' : ''}
                  ${isPending ? 'bg-white border-gray-200 text-gray-400' : ''}
                `}
              >
                <Icon 
                  className={`w-6 h-6 transition-transform duration-300`} 
                  strokeWidth={isCompleted || isCurrent ? 2.5 : 2} 
                />
              </div>
              
              <div className={`mt-4 text-center transition-all duration-500 ${isCurrent ? 'translate-y-1' : ''}`}>
                <p className={`text-[13px] sm:text-sm font-medium tracking-tight transition-colors duration-300 ${isCurrent ? 'text-[#1A365D]' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                  {stage.label}
                </p>
                <p className={`hidden sm:block text-[11px] mt-0.5 transition-colors duration-300 font-normal uppercase ${isCurrent ? 'text-[#3182CE]' : 'text-gray-400'}`}>
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
