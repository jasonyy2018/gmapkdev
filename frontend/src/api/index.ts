import axios from 'axios';
import type { Lead } from './types';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

export const leadsApi = {
    getAll: async (): Promise<Lead[]> => {
        const response = await api.get('/leads');
        return response.data;
    },

    getById: async (id: number): Promise<Lead> => {
        const response = await api.get(`/leads/${id}`);
        return response.data;
    },
};

export const searchApi = {
    search: async (query: string, location?: string): Promise<Lead[]> => {
        const response = await api.post('/leads/search', null, {
            params: { query, location }
        });
        return response.data;
    },
};
