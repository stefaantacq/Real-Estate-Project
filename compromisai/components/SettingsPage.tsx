import React from 'react';
import { ArrowLeft, Bell, Shield, Trash2, Eye } from 'lucide-react';
import { Language, UserSettings } from '../types';
import { TRANSLATIONS } from '../constants';
import { SettingsService } from '../services/settingsService';

interface SettingsPageProps {
    lang: Language;
    onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ lang, onBack }) => {
    const t = TRANSLATIONS[lang];
    const [settings, setSettings] = React.useState<UserSettings>(SettingsService.getSettings());

    const handleToggle = (key: keyof UserSettings) => {
        const updated = SettingsService.updateSettings({ [key]: !settings[key] });
        setSettings(updated);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 mr-4">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.settings}</h1>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-brand-500" />
                            Privacy & Veiligheid
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">{t.settingsDeleteConfirmation}</h3>
                                <p className="text-sm text-slate-500">Vraagt om bevestiging voordat een dossier definitief wordt verwijderd.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('showDeleteConfirmation')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-brand-500 ${settings.showDeleteConfirmation ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showDeleteConfirmation ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Other Placeholder Sections */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 opacity-50">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-slate-400" />
                            Notificaties
                        </h2>
                    </div>
                    <div className="p-12 text-center text-slate-400">
                        <p>Binnenkort beschikbaar</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 opacity-50">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-slate-400" />
                            Weergave
                        </h2>
                    </div>
                    <div className="p-12 text-center text-slate-400">
                        <p>Binnenkort beschikbaar</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
