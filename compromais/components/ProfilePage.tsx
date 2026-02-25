import React from 'react';
import { User, Mail, ArrowLeft, Shield } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProfilePageProps {
    lang: Language;
    onBack: () => void;
    user?: { id: number; name: string; email: string } | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ lang, onBack, user }) => {
    const t = TRANSLATIONS[lang];

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 mr-4"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.accountDetails}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Avatar & Quick Info */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-brand-50 dark:ring-brand-900/20">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user?.name || 'Onbekende Gebruiker'}</h2>
                        <p className="text-sm text-slate-500 mb-6">{user?.email}</p>

                        <div className="w-full pt-6 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex items-center justify-center gap-2 text-brand-600 dark:text-brand-400 font-medium text-sm">
                                <Shield className="w-4 h-4" />
                                <span>Geverifieerd Account</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white">Persoonlijke Informatie</h3>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t.userName}</label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white">{user?.name || '---'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t.userEmail}</label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white">{user?.email || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
