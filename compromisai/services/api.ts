import { Template } from '../types';

export const API_BASE_URL = '/api';

export const api = {
    // Generic fetch wrapper
    async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
        };

        // Only set Content-Type to application/json if it's not already set 
        // AND the body is NOT FormData (browser sets boundary for FormData)
        if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
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

    async updateVersion(versionId: string, data: any) {
        return this.request(`/dossiers/versions/${versionId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async renameVersion(versionId: string, newName: string) {
        return this.request(`/dossiers/versions/${versionId}/rename`, {
            method: 'PATCH',
            body: JSON.stringify({ name: newName }),
        });
    },

    async deleteVersion(id: string) {
        return this.request(`/dossiers/versions/${id}`, {
            method: 'DELETE',
        });
    },

    async createAgreement(dossierId: string, templateId: string) {
        return this.request(`/dossiers/${dossierId}/agreements`, {
            method: 'POST',
            body: JSON.stringify({ template_id: templateId }),
        });
    },

    async deleteAgreement(agreementId: string) {
        return this.request(`/dossiers/agreements/${agreementId}`, {
            method: 'DELETE',
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

    async createTemplate(data: any) {
        return this.request('/templates', {
            method: 'POST',
            body: data,
            headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
        });
    },

    async deleteTemplate(id: string) {
        return this.request(`/templates/${id}`, {
            method: 'DELETE',
        });
    },

    async archiveTemplate(id: string, isArchived: boolean) {
        return this.request(`/templates/${id}/archive`, {
            method: 'PATCH',
            body: JSON.stringify({ is_archived: isArchived }),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async checkAiStatus() {
        return this.request('/ai/status', { method: 'GET' });
    }
};
