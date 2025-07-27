import React from 'react';
import { ThinkingState, ThinkingStep } from '../types';
import { AnalyzeIcon } from './icons/AnalyzeIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { DraftIcon } from './icons/DraftIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const iconMap: Record<ThinkingStep['id'], React.FC<React.SVGProps<SVGSVGElement>>> = {
    analyze: AnalyzeIcon,
    search: GlobeIcon,
    draft: DraftIcon,
    generate: GenerateIcon,
};

const Spinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-t-gray-400 border-r-gray-400 border-b-gray-400 border-l-transparent rounded-full animate-spin"></div>
);

const ThinkingIndicator: React.FC<{ thinkingState: ThinkingState }> = ({ thinkingState }) => {
    
    return (
        <div className="flex flex-col space-y-3 p-4 rounded-lg bg-gray-900/50 w-full max-w-sm">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-gray-400" />
                Cognito is thinking...
            </h4>
            <div className="space-y-2.5">
                {thinkingState.steps.map((step, index) => {
                    const isActive = index === thinkingState.activeStepIndex;
                    const isCompleted = index < thinkingState.activeStepIndex;
                    const IconComponent = iconMap[step.id];

                    return (
                        <div key={step.id} className="flex items-center gap-3 transition-all duration-300">
                           <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isActive ? 'bg-gray-700/50' : 'bg-gray-800/50'}`}>
                                {isCompleted ? (
                                    <CheckIcon className="w-4 h-4 text-green-400" />
                                ) : isActive ? (
                                    <Spinner />
                                ) : (
                                    <IconComponent className="w-4 h-4 text-gray-500" />
                                )}
                           </div>
                            <span className={`text-sm ${isActive ? 'text-gray-200 font-medium' : isCompleted ? 'text-gray-500 line-through' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ThinkingIndicator;