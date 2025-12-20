
import { Dossier, DossierStatus } from '../types';
import { MOCK_DOSSIERS } from '../constants';

const STORAGE_KEY = 'compromisai_dossiers';

export const DossierService = {
    // Initialize storage with mocks if empty
    init: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DOSSIERS));
        }
    },

    getAll: (): Dossier[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return MOCK_DOSSIERS;
        try {
            return JSON.parse(stored);
        } catch (e) {
            return MOCK_DOSSIERS;
        }
    },

    getById: (id: string): Dossier | undefined => {
        const dossiers = DossierService.getAll();
        return dossiers.find(d => d.id === id);
    },

    update: (updatedDossier: Dossier) => {
        const dossiers = DossierService.getAll();
        const index = dossiers.findIndex(d => d.id === updatedDossier.id);
        if (index !== -1) {
            dossiers[index] = updatedDossier;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
        }
    },

    add: (dossier: Dossier) => {
        const dossiers = DossierService.getAll();
        dossiers.push(dossier);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
    }
};
