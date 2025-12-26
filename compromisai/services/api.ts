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

    async createDossier(data: FormData) {
        return this.request('/dossiers', {
            method: 'POST',
            body: data,
            headers: {}, // Fetch will automatically set the correct Content-Type for FormData
        });
    },

    async deleteDossier(id: string) {
        return this.request(`/dossiers/${id}`, {
            method: 'DELETE',
        });
    },

    async updateDossier(id: string, data: { name?: string; address?: string; status?: string; remarks?: string }) {
        return this.request(`/dossiers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Versions
    async getVersion(id: string) {
        return this.request(`/dossiers/versions/${id}`);
    },

    async updateVersion(id: string, sections: any[]) {
        return this.request(`/dossiers/versions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ sections }),
        });
    },

    async createAgreement(dossierId: string, templateId: string) {
        return this.request(`/dossiers/${dossierId}/agreements`, {
            method: 'POST',
            body: JSON.stringify({ template_id: templateId }),
        });
    },

    async createVersion(agreementId: string, data: FormData) {
        return this.request(`/dossiers/agreements/${agreementId}/versions`, {
            method: 'POST',
            body: data,
            headers: {},
        });
    },

    // Templates
    async getTemplates() {
        return this.request('/templates');
    },

    async getTemplateById(id: string) {
        return this.request(`/templates/${id}`);
    },

    async updateTemplate(id: string, data: { name: string; title?: string; description: string; sections: any[] }) {
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
