
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, FileText, BrainCircuit } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ExtractionLoadingProps {
    onComplete: () => void;
    lang: Language;
}

export const ExtractionLoading: React.FC<ExtractionLoadingProps> = ({ onComplete, lang }) => {
    const [step, setStep] = useState(0);
    const t = TRANSLATIONS[lang];

    const steps = [
        { text: t.uploadingDocs, icon: FileText },
        { text: t.analyzingContent, icon: BrainCircuit },
        { text: t.extractingData, icon: Loader2 },
        { text: t.finalizingCompromise, icon: CheckCircle }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => {
                if (prev >= steps.length - 1) {
                    clearInterval(timer);
                    setTimeout(onComplete, 800); // Small delay before finishing
                    return prev;
                }
                return prev + 1;
            });
        }, 1500); // 1.5s per step

        return () => clearInterval(timer);
    }, [onComplete, steps.length]);

    return (
        <div className="fixed inset-0 bg-white/90 dark:bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-slate-800 text-center">

                <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <BrainCircuit className="w-10 h-10 text-brand-600 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-brand-200 dark:border-brand-800 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent"></div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                    {t.aiWorking}
                </h2>

                <div className="space-y-4 text-left">
                    {steps.map((s, index) => {
                        const Icon = s.icon;
                        const isActive = index === step;
                        const isCompleted = index < step;
                        const isPending = index > step;

                        return (
                            <div
                                key={index}
                                className={`flex items-center p-3 rounded-lg transition-all duration-500
                    ${isActive ? 'bg-brand-50 dark:bg-slate-800 border-l-4 border-brand-500 shadow-sm scale-105' : 'border-l-4 border-transparent'}
                    ${isPending ? 'opacity-40' : 'opacity-100'}
                `}
                            >
                                <div className={`mr-4 transition-colors ${isActive || isCompleted ? 'text-brand-600' : 'text-slate-300'}`}>
                                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} />}
                                </div>
                                <span className={`font-medium ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                    {s.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
