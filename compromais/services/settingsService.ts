import { UserSettings } from '../types';
import { api } from './api';

const STORAGE_KEY = 'compromisai_settings';

const DEFAULT_SETTINGS: UserSettings = {
    showDeleteConfirmation: true,
    showVersionDeleteConfirmation: true,
    showAgreementDeleteConfirmation: true,
    customDocumentPrompt: '',
    customTemplatePrompt: '',
};

export const SettingsService = {
    getSettings: (): UserSettings => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { ...DEFAULT_SETTINGS };
        try {
            const parsed = JSON.parse(stored);
            // Migration: rename aiExtractionPrompt to customDocumentPrompt
            if (parsed.aiExtractionPrompt && !parsed.customDocumentPrompt) {
                parsed.customDocumentPrompt = parsed.aiExtractionPrompt;
                delete parsed.aiExtractionPrompt;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            return { ...DEFAULT_SETTINGS };
        }
    },

    updateSettings: (settings: Partial<UserSettings>) => {
        const current = SettingsService.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        // Sync to backend if it's one of the AI prompts
        if (settings.customDocumentPrompt !== undefined || settings.customTemplatePrompt !== undefined) {
             api.updateSettings({
                 customDocumentPrompt: updated.customDocumentPrompt,
                 customTemplatePrompt: updated.customTemplatePrompt
             }).catch(err => console.error('Failed to sync settings to backend:', err));
        }
        
        return updated;
    },

    syncWithUser: (user: any) => {
        if (!user) return;
        const current = SettingsService.getSettings();
        const updated = {
            ...current,
            customDocumentPrompt: user.customDocumentPrompt ?? current.customDocumentPrompt,
            customTemplatePrompt: user.customTemplatePrompt ?? current.customTemplatePrompt,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
};
