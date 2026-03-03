import { Space, Column, Card } from './types'; 

const API_BASE_URL = "http://localhost:8080/api";

export const vortexApi = {
    getWorkspaces: async (): Promise<Space[]> => {
        const response = await fetch(`${API_BASE_URL}/workspaces`);
        if (!response.ok) throw new Error("Error fetching workspaces");
        return response.json();
    },

    createWorkspace: async (name: string, repoUrl: string, defaultBranch: string) => {

        const response = await fetch(`${API_BASE_URL}/workspaces`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, repoUrl, defaultBranch, icon: '' })
        });
        return response.json();
    },

    createColumn: async (workspaceId: string, title: string, keyword: string, color: string) => {

        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/columns`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, keyword, color, isDoneColumn: false })
        });
        return response.json();
    },

    moveCardManual: async (cardId: string, newColumnId: string) => {

        const response = await fetch(`${API_BASE_URL}/cards/${cardId}/move/${newColumnId}`, {

            method: 'PUT'
        });
        return response.json();
    }
};