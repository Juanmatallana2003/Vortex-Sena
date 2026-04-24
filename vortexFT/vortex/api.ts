import { Space, Column, Card, ChangeLogEntry, Tag, AppNotification, NotificationAction } from './types';

const API_BASE_URL = "http://localhost:8080/api";

const defaultConfig = {
    credentials: "include" as RequestCredentials
};

export class ApiError extends Error {
    status: number;
    details: string;

    constructor(message: string, status: number, details = "") {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

const extractErrorMessage = (rawBody: string, fallbackMessage: string): string => {
    if (!rawBody) {
        return fallbackMessage;
    }

    try {
        const parsed = JSON.parse(rawBody);
        if (typeof parsed?.message === "string" && parsed.message.trim() !== "") {
            return parsed.message;
        }
        if (typeof parsed?.error === "string" && parsed.error.trim() !== "") {
            return parsed.error;
        }
    } catch {
        // Not a JSON response; fallback to raw text.
    }

    return rawBody.trim() || fallbackMessage;
};

const throwApiError = async (response: Response, fallbackMessage: string): Promise<never> => {
    let rawBody = "";
    try {
        rawBody = await response.text();
    } catch {
        rawBody = "";
    }

    const message = extractErrorMessage(rawBody, fallbackMessage);
    throw new ApiError(message, response.status, rawBody);
};

const requestJson = async <T = any>(url: string, init: RequestInit, fallbackMessage: string): Promise<T> => {
    const response = await fetch(url, init);
    if (!response.ok) {
        return throwApiError(response, fallbackMessage);
    }
    return response.json();
};

const requestNoContent = async (url: string, init: RequestInit, fallbackMessage: string): Promise<true> => {
    const response = await fetch(url, init);
    if (!response.ok) {
        return throwApiError(response, fallbackMessage);
    }
    return true;
};

export const vortexApi = {

    getEventsStreamUrl: () => `${API_BASE_URL}/events/stream`,

    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, defaultConfig);
        return response.json();
    },

    getGithubRealRepos: async (): Promise<any[]> => {
        const rRep = await fetch(`${API_BASE_URL}/auth/repos`, defaultConfig);
        if (!rRep.ok) return [];
        return rRep.json();
    },

    getWorkspaces: async (): Promise<Space[]> => {
        return requestJson<Space[]>(`${API_BASE_URL}/workspaces`, defaultConfig, "Error fetching workspaces");
    },

    createWorkspace: async (name: string, repoUrl: string, defaultBranch: string): Promise<Space> => {
        return requestJson<Space>(`${API_BASE_URL}/workspaces`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, repoUrl, defaultBranch, icon: 'fa-regular fa-folder' })
        }, "No se pudo crear el espacio");
    },

    updateWorkspace: async (workspaceId: string, name: string, repoUrl: string, defaultBranch: string): Promise<Space> => {
        return requestJson<Space>(`${API_BASE_URL}/workspaces/${workspaceId}`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, repoUrl, defaultBranch })
        }, "Error updating workspace");
    },

    deleteWorkspace: async (workspaceId: string) => {
        return requestNoContent(`${API_BASE_URL}/workspaces/${workspaceId}`, {
            ...defaultConfig,
            method: 'DELETE'
        }, "Error deleting workspace");
    },

    inviteMember: async (workspaceId: string, inputData: string, type: 'email' | 'github', avatarData: string) => {
        return requestJson(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: inputData, type: type, avatar: avatarData })
        }, "Fallo en el servidor de invitaciones");
    },

    createColumn: async (workspaceId: string, title: string, keyword: string, color: string) => {
        return requestJson(`${API_BASE_URL}/workspaces/${workspaceId}/columns`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, keyword, color, isDoneColumn: false })
        }, "No se pudo crear la columna");
    },

    updateColumnDataBD: async (columnId: string, updatedTitleDataTitleAndInfo: Partial<Column>) => {
        return requestJson(`${API_BASE_URL}/columns/${columnId}`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTitleDataTitleAndInfo)
        }, "Error actualizando la columna");
    },

    deleteColumn: async (columnId: string) => {
        return requestNoContent(`${API_BASE_URL}/columns/${columnId}`, {
            ...defaultConfig,
            method: 'DELETE'
        }, "No se pudo eliminar la columna");
    },

    reorderColumns: async (workspaceId: string, orderedColumnIds: string[]) => {
        return requestNoContent(`${API_BASE_URL}/workspaces/${workspaceId}/columns/reorder`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderedColumnIds)
        }, "Fallo guardando el orden de las columnas en DB");
    },

    createCard: async (columnId: string, issueNumber: number, title: string, description: string) => {
        return requestJson(`${API_BASE_URL}/columns/${columnId}/cards`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issueNumber, title, description })
        }, "No se pudo crear la tarjeta");
    },

    moveCardManual: async (cardId: string, newColumnId: string, targetIndex?: number) => {
        const endpoint = typeof targetIndex === "number"
            ? `${API_BASE_URL}/cards/${cardId}/move/${newColumnId}?targetIndex=${encodeURIComponent(targetIndex)}`
            : `${API_BASE_URL}/cards/${cardId}/move/${newColumnId}`;

        return requestJson(endpoint, {
            ...defaultConfig,
            method: 'PUT'
        }, "No se pudo mover la tarjeta");
    },

    updateCardDetails: async (
        cardId: string,
        title: string,
        description: string,
        dueDate?: string,
        assignees?: string[],
        tags?: Tag[]
    ) => {
        return requestJson(`${API_BASE_URL}/cards/${cardId}`, {
            ...defaultConfig,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                dueDate: dueDate || null,
                assignees: assignees || [],
                tags: tags || []
            })
        }, "Error actualizando la tarjeta");
    },

    deleteCard: async (cardId: string) => {
        return requestNoContent(`${API_BASE_URL}/cards/${cardId}`, {
            ...defaultConfig,
            method: 'DELETE'
        }, "Error borrando la tarjeta");
    },

    cerrarIssueEnGithub: async (cardId: string) => {
        return requestNoContent(`${API_BASE_URL}/cards/${cardId}/close_github`, {
            ...defaultConfig,
            method: 'PATCH'
        }, "No se pudo cerrar la issue en GitHub");
    },

    getWorkspaceHistory: async (workspaceId: string): Promise<ChangeLogEntry[]> => {
        const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/history`, defaultConfig);
        if (!response.ok) return [];
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
        return requestJson(`${API_BASE_URL}/workspaces/${workspaceId}/history`, {
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
        }, "No se pudo registrar el historial");
    },

    getFavoriteSpaces: async (): Promise<Space[]> => {
        const response = await fetch(`${API_BASE_URL}/user/favorites`, defaultConfig);
        if (!response.ok) return [];
        return response.json();
    },

    toggleFavoriteSpace: async (workspaceId: string) => {
        return requestNoContent(`${API_BASE_URL}/user/favorites/${workspaceId}`, {
            ...defaultConfig,
            method: 'POST'
        }, "Error toggling favorite");
    },

    getNotifications: async (scope: 'all' | 'unread' = 'all'): Promise<AppNotification[]> => {
        return requestJson<AppNotification[]>(`${API_BASE_URL}/notifications?scope=${scope}`, defaultConfig, "No se pudieron cargar las notificaciones");
    },

    getFocusNotifications: async (): Promise<AppNotification[]> => {
        return requestJson<AppNotification[]>(`${API_BASE_URL}/notifications/focus`, defaultConfig, "No se pudieron cargar las notificaciones prioritarias");
    },

    getUnreadNotificationsCount: async (): Promise<number> => {
        const response = await requestJson<{ unreadCount: number }>(`${API_BASE_URL}/notifications/unread-count`, defaultConfig, "No se pudo cargar el contador de notificaciones");
        return response.unreadCount || 0;
    },

    markNotificationRead: async (notificationId: string): Promise<AppNotification> => {
        return requestJson<AppNotification>(`${API_BASE_URL}/notifications/${notificationId}/read`, {
            ...defaultConfig,
            method: 'PATCH'
        }, "No se pudo marcar la notificacion como leida");
    },

    markAllNotificationsRead: async (): Promise<true> => {
        return requestNoContent(`${API_BASE_URL}/notifications/read-all`, {
            ...defaultConfig,
            method: 'PATCH'
        }, "No se pudieron marcar todas las notificaciones");
    },

    snoozeNotification24h: async (notificationId: string): Promise<AppNotification> => {
        return requestJson<AppNotification>(`${API_BASE_URL}/notifications/${notificationId}/snooze`, {
            ...defaultConfig,
            method: 'PATCH'
        }, "No se pudo posponer la notificacion");
    },

    executeNotificationAction: async (notificationId: string, action: NotificationAction): Promise<AppNotification> => {
        return requestJson<AppNotification>(`${API_BASE_URL}/notifications/${notificationId}/actions`, {
            ...defaultConfig,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        }, "No se pudo ejecutar la accion");
    }
};
