import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface DeleteConfirmationModalProps {
    lang: Language;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (dontShowAgain: boolean) => void;
    title?: string;
    message?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    lang, isOpen, onClose, onConfirm, title, message
}) => {
    const t = TRANSLATIONS[lang];
    const [dontShowAgain, setDontShowAgain] = React.useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {title || t.deleteDossier}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        {message || t.deleteConfirmation}
                    </p>

                    <label className="flex items-center space-x-3 mb-8 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 checked:bg-brand-600 dark:checked:bg-brand-500 transition-all"
                            />
                            <span className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {t.dontShowAgain}
                        </span>
                    </label>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={() => onConfirm(dontShowAgain)}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all"
                        >
                            {t.confirmDelete}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
