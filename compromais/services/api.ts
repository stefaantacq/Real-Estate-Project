import { Template } from '../types';

export const API_BASE_URL = '/api';

export const api = {
    // Generic fetch wrapper
    async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
        };

        // Add Authorization header if token exists
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

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

    // Auth
    async logIn(credentials: any) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        return data;
    },

    async register(userData: any) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async getMe() {
        return this.request('/auth/me');
    },

    logOut() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
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

    async reorderDossiers(orders: { id: string; order: number; status?: string }[]) {
        return this.request('/dossiers/reorder', {
            method: 'PATCH',
            body: JSON.stringify({ orders }),
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

    async toggleVersionBookmark(versionId: string, isBookmarked: boolean) {
        return this.request(`/dossiers/versions/${versionId}/bookmark`, {
            method: 'PATCH',
            body: JSON.stringify({ isBookmarked }),
        });
    },

    async exportVersion(versionId: string, format: 'pdf' | 'docx') {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/dossiers/versions/${versionId}/export?format=${format}`, {
            headers
        });
        if (!response.ok) throw new Error('Export failed');

        // Handle Blob download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${format}`; // Server sets this, but backup here
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
    },

    async deleteVersion(id: string) {
        return this.request(`/dossiers/versions/${id}`, {
            method: 'DELETE',
        });
    },

    async createAgreement(dossierId: string, templateId: string, remarks?: string) {
        return this.request(`/dossiers/${dossierId}/agreements`, {
            method: 'POST',
            body: JSON.stringify({ template_id: templateId, remarks }),
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
    },

    async chatWithAi(messages: { role: 'user' | 'model', content: string }[], contextText: string) {
        return this.request('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ messages, contextText })
        });
    },

    async streamChatWithAi(messages: { role: 'user' | 'model', content: string }[], contextText: string, onMessage: (chunk: string) => void) {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/ai/chat-stream`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ messages, contextText })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `Request failed with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder('utf-8');
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const chunkText = decoder.decode(value, { stream: true });
                if (chunkText) {
                    onMessage(chunkText);
                }
            }
        }
    }
};
