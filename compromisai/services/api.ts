import { Template } from '../types';

export const API_BASE_URL = '/api';

export const api = {
    // Generic fetch wrapper
    async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        return response.json();
    },

    // Test connection
    async testConnection() {
        return this.request('/test');
    },

    // Dossiers
    async getDossiers() {
        return this.request('/dossiers');
    },

    async getDossierById(id: string) {
        return this.request(`/dossiers/${id}`);
    },

    async createDossier(data: { titel: string; verkoper_naam: string; adres: string }) {
        return this.request('/dossiers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async deleteDossier(id: string) {
        return this.request(`/dossiers/${id}`, {
            method: 'DELETE',
        });
    },

    // Templates
    async getTemplates() {
        return this.request('/templates');
    },

    async getTemplateById(id: string) {
        return this.request(`/templates/${id}`);
    },

    async updateTemplate(id: string, data: { name: string; description: string; sections: any[] }) {
        return this.request(`/templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async createTemplate(data: Template) {
        return this.request('/templates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async deleteTemplate(id: string) {
        return this.request(`/templates/${id}`, {
            method: 'DELETE',
        });
    }
};
