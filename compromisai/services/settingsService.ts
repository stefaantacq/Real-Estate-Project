import { UserSettings } from '../types';

const STORAGE_KEY = 'compromisai_settings';

const DEFAULT_SETTINGS: UserSettings = {
    showDeleteConfirmation: true,
    showVersionDeleteConfirmation: true,
    showAgreementDeleteConfirmation: true,
};

export const SettingsService = {
    getSettings: (): UserSettings => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { ...DEFAULT_SETTINGS };
        try {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch (e) {
            return { ...DEFAULT_SETTINGS };
        }
    },

    updateSettings: (settings: Partial<UserSettings>) => {
        const current = SettingsService.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    }
};
