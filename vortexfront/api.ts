import { Space, Column, Card, ChangeLogEntry, Tag, AppNotification } from './types'; 

const API_BASE_URL = "http://localhost:8080/api";

const defaultConfig = {
    credentials: "include" as RequestCredentials
};

export const vortexApi = {

    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, defaultConfig);
        return response.json();
    },

    getNotifications: async (scope: 'all' | 'unread' = 'all'): Promise<AppNotification[]> => {
        const response = await fetch(`${API_BASE_URL}/notifications?scope=${scope}`, defaultConfig);
        if (!response.ok) throw new Error("Error fetching notifications");
        return response.json();
    },

    getUnreadNotificationsCount: async (): Promise<number> => {
        const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, defaultConfig);
        if (!response.ok) return 0;
        const data = await response.json();
        return Number(data.unreadCount || 0);
    },

    markNotificationRead: async (notificationId: string): Promise<AppNotification> => {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            ...defaultConfig,
            method: 'PATCH'
        });
        if (!response.ok) throw new Error("Error marking notification as read");
        return response.json();
    },

    markAllNotificationsRead: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
            ...defaultConfig,
            method: 'PATCH'
        });
        if (!response.ok) throw new Error("Error marking all notifications as read");
        return true;
    },

    snoozeNotification24h: async (notificationId: string): Promise<AppNotification> => {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/snooze`, {
            ...defaultConfig,
            method: 'PATCH'
        });
        if (!response.ok) throw new Error("Error snoozing notification");
        return response.json();
    },

    executeNotificationAction: async (notificationId: string, action: string): Promise<AppNotification> => {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/actions`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        if (!response.ok) throw new Error("Error executing notification action");
        return response.json();
    },

    getEventsStreamUrl: () => `${API_BASE_URL}/events/stream`,

    getGithubRealRepos: async (): Promise<any[]> => {
        const rRep = await fetch(`${API_BASE_URL}/auth/repos`, defaultConfig);
        if(!rRep.ok) return[]; 
        return rRep.json();
    },

    getWorkspaces: async (): Promise<Space[]> => {
        const response = await fetch(`${API_BASE_URL}/workspaces`, defaultConfig);
        if (!response.ok) throw new Error("Error fetching workspaces");
        return response.json();
    },

    createWorkspace: async (name: string, repoUrl: string, defaultBranch: string) => {
        const response = await fetch(`${API_BASE_URL}/workspaces`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, repoUrl, defaultBranch, icon: 'fa-regular fa-folder' })
        });
        return response.json();
    },

    updateWorkspace: async (workspaceId: string, name: string, repoUrl: string, defaultBranch: string) => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, repoUrl, defaultBranch })
        });
        if (!response.ok) throw new Error("Error updating workspace");
        return response.json();
    },

    deleteWorkspace: async (workspaceId: string) => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}`, {
            ...defaultConfig,
            method: 'DELETE'
        });
        if (!response.ok) throw new Error("Error deleting workspace");
        return true;
    },

    inviteMember: async (workspaceId: string, inputData: string, type: 'email' | 'github', avatarData: string) => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: inputData, type: type, avatar: avatarData })
        });
        if (!response.ok) throw new Error("Fallo en el servidor de invitaciones");
        return response.json();
    },

    createColumn: async (workspaceId: string, title: string, keyword: string, color: string) => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/columns`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, keyword, color, isDoneColumn: false })
        });
        return response.json();
    },

    updateColumnDataBD: async (columnId: string, updatedTitleDataTitleAndInfo: Partial<Column>) => {
        const correctResponse = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTitleDataTitleAndInfo)
        });
        if (!correctResponse.ok) throw new Error("Error actualizando la columna");
        return correctResponse.json();
    },

    reorderColumns: async (workspaceId: string, orderedColumnIds: string[]) => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/columns/reorder`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderedColumnIds)
        });
        if (!response.ok) throw new Error("Fallo guardando el orden de las columnas en DB");
        return true;
    },

    createCard: async (columnId: string, issueNumber: number, title: string, description: string) => {
        const response = await fetch(`${API_BASE_URL}/columns/${columnId}/cards`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issueNumber, title, description })
        });
        return response.json();
    },

    moveCardManual: async (cardId: string, newColumnId: string) => {
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}/move/${newColumnId}`, {
            ...defaultConfig,
            method: 'PUT'
        });
        return response.json();
    },

    // ======== ⚡ CORREGIDO: Edición Completa con Etiquetas y Fechas ========
    updateCardDetails: async (
        cardId: string, 
        title: string, 
        description: string, 
        dueDate?: string, 
        assignees?: string[], 
        tags?: Tag[]
    ) => {
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title, 
                description,
                dueDate: dueDate || null,
                assignees: assignees || [],
                tags: tags ||[]
            })
        });
        if (!response.ok) throw new Error("Error actualizando la tarjeta");
        return response.json();
    },

    deleteCard: async (cardId: string) => {
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            ...defaultConfig,
            method: 'DELETE'
        });
        if (!response.ok) throw new Error("Error borrando");
        return true;
    },

    cerrarIssueEnGithub: async (cardId: string) => {
         const response = await fetch(`${API_BASE_URL}/cards/${cardId}/close_github`, {
            ...defaultConfig,
            method: 'PATCH'
         });
        return response;
    },

    getWorkspaceHistory: async (workspaceId: string): Promise<ChangeLogEntry[]> => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/history`, defaultConfig);
        if (!response.ok) return[];
        const data = await response.json();
        
        return data.map((log: any) => ({
            id: log.id,
            type: log.type,
            description: log.description,
            details: log.details || "",
            cardId: log.cardId,
            timestamp: log.timestamp,
            user: {
                name: log.userName || "Sistema",
                avatar: log.userAvatar || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            }
        }));
    },

    addHistoryLog: async (workspaceId: string, logData: any) => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/history`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: logData.type,
                description: logData.description,
                details: logData.details,
                cardId: logData.cardId,
                userName: logData.user.name,
                userAvatar: logData.user.avatar
            })
        });
        return response.json();
    },

    // ======== ⚡ FAVORITOS ========
    getFavoriteSpaces: async (): Promise<Space[]> => {
        const response = await fetch(`${API_BASE_URL}/user/favorites`, defaultConfig);
        if (!response.ok) return[];
        return response.json();
    },

    toggleFavoriteSpace: async (workspaceId: string) => {
        const response = await fetch(`${API_BASE_URL}/user/favorites/${workspaceId}`, {
            ...defaultConfig,
            method: 'POST'
        });
        if (!response.ok) throw new Error("Error toggling favorite");
        return true;
    }
};
