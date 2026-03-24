import React from 'react';
import { ArrowLeft, Bell, Shield, Trash2, Eye, BrainCircuit } from 'lucide-react';
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

    const handleDocumentPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const updated = SettingsService.updateSettings({ customDocumentPrompt: value });
        setSettings(updated);
    };

    const handleTemplatePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const updated = SettingsService.updateSettings({ customTemplatePrompt: value });
        setSettings(updated);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-500 mr-4">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">{t.settings}</h1>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-blue-500" />
                            {t.privacySecurity}
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900">{t.settingsDeleteConfirmation}</h3>
                            </div>
                            <button
                                onClick={() => handleToggle('showDeleteConfirmation')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.showDeleteConfirmation ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showDeleteConfirmation ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900">{t.settingsDeleteVersionConfirmation}</h3>
                            </div>
                            <button
                                onClick={() => handleToggle('showVersionDeleteConfirmation')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.showVersionDeleteConfirmation ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showVersionDeleteConfirmation ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900">{t.settingsDeleteAgreementConfirmation}</h3>
                            </div>
                            <button
                                onClick={() => handleToggle('showAgreementDeleteConfirmation')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.showAgreementDeleteConfirmation ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showAgreementDeleteConfirmation ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Settings */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <BrainCircuit className="w-5 h-5 mr-2 text-blue-500" />
                            {t.aiSettings}
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t.docPromptLabel}
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                {t.docPromptDesc}
                            </p>
                            <textarea
                                value={settings.customDocumentPrompt || ''}
                                onChange={handleDocumentPromptChange}
                                placeholder="{t.docPromptPlaceholder}"
                                className="w-full h-24 p-4 bg-slate-50 border border-gray-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t.tplPromptLabel}
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                {t.tplPromptDesc}
                            </p>
                            <textarea
                                value={settings.customTemplatePrompt || ''}
                                onChange={handleTemplatePromptChange}
                                placeholder="{t.tplPromptPlaceholder}"
                                className="w-full h-24 p-4 bg-slate-50 border border-gray-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Other Placeholder Sections */}
                <div className="bg-white rounded-2xl border border-gray-200 opacity-50">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <Bell className="w-5 h-5 mr-2 text-slate-400" />
                            {t.notifications}
                        </h2>
                    </div>
                    <div className="p-12 text-center text-slate-400">
                        <p>{t.comingSoon}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-blue-500" />
                            {t.displayOptions}
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900">{t.showAiStatusSetting}</h3>
                                <p className="text-sm text-slate-500">{t.showAiStatusDesc}</p>
                            </div>
                            <button
                                onClick={() => handleToggle('showAiStatus')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 ${settings.showAiStatus ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showAiStatus ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
