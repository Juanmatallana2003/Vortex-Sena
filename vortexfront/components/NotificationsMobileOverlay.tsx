"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { vortexApi } from '../api';
import { AppNotification } from '../types';

interface NotificationsMobileOverlayProps {
  onClose: () => void;
  onOpenCard?: (notification: AppNotification) => void;
  onNotificationsChanged?: () => void;
}

type NotificationScope = 'all' | 'unread';

const actionLabels: Record<string, string> = {
  open_card: 'Abrir tarjeta',
  assign_me: 'Asignarme',
  start_now: 'Iniciar',
  mark_done: 'Finalizar',
  snooze_24h: 'Posponer 24h',
  dismiss: 'Descartar',
};

const actionIcons: Record<string, string> = {
  assign_me: 'fa-solid fa-user-plus',
  start_now: 'fa-solid fa-play',
  mark_done: 'fa-solid fa-check',
  snooze_24h: 'fa-regular fa-clock',
  dismiss: 'fa-solid fa-xmark',
};

const priorityLabels: Record<string, string> = {
  critical: 'Urgente',
  important: 'Importante',
  info: 'Info',
};

const priorityClasses: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-200 ring-red-500/30',
  important: 'bg-amber-500/10 text-amber-200 ring-amber-500/30',
  info: 'bg-blue-500/10 text-blue-200 ring-blue-500/30',
};

const notificationVisuals = {
  success: {
    icon: 'fa-solid fa-check',
    bar: 'bg-emerald-400',
    dot: 'bg-emerald-400 shadow-emerald-400/30',
    iconBox: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
    accent: 'from-emerald-500/12',
  },
  movement: {
    icon: 'fa-solid fa-arrow-right-arrow-left',
    bar: 'bg-sky-400',
    dot: 'bg-sky-400 shadow-sky-400/30',
    iconBox: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
    accent: 'from-sky-500/12',
  },
  github: {
    icon: 'fa-brands fa-github',
    bar: 'bg-violet-400',
    dot: 'bg-violet-400 shadow-violet-400/30',
    iconBox: 'bg-violet-500/10 text-violet-300 ring-violet-500/25',
    accent: 'from-violet-500/12',
  },
  alert: {
    icon: 'fa-solid fa-triangle-exclamation',
    bar: 'bg-red-400',
    dot: 'bg-red-400 shadow-red-400/30',
    iconBox: 'bg-red-500/10 text-red-300 ring-red-500/25',
    accent: 'from-red-500/12',
  },
  collaboration: {
    icon: 'fa-solid fa-user-check',
    bar: 'bg-amber-300',
    dot: 'bg-amber-300 shadow-amber-300/30',
    iconBox: 'bg-amber-500/10 text-amber-200 ring-amber-500/25',
    accent: 'from-amber-500/12',
  },
  system: {
    icon: 'fa-solid fa-table-columns',
    bar: 'bg-neutral-400',
    dot: 'bg-neutral-400 shadow-neutral-400/20',
    iconBox: 'bg-neutral-700/50 text-neutral-300 ring-neutral-600/50',
    accent: 'from-neutral-500/10',
  },
};

const visualByNotification = (notification: AppNotification) => {
  const type = notification.type.toLowerCase();
  if (notification.priority === 'critical' || type.includes('risk')) return notificationVisuals.alert;
  if (type.includes('created')) return notificationVisuals.success;
  if (type.includes('status') || type.includes('moved')) return notificationVisuals.movement;
  if (type.includes('invite') || type.includes('assign')) return notificationVisuals.collaboration;
  if (type.includes('github')) return notificationVisuals.github;
  if (type.includes('column')) return notificationVisuals.system;
  return notificationVisuals.github;
};

const formatNotificationTime = (value?: string | null) => {
  if (!value) return '';

  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return '';

  const diffMs = Date.now() - created.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d`;

  return created.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

const getActorLabel = (notification: AppNotification) => (
  notification.actorName || notification.actorLogin || 'Vortex'
);

const getTicketNumber = (notification: AppNotification) => {
  const match = `${notification.title} ${notification.message}`.match(/#\d+/);
  return match?.[0] || null;
};

const getReadableMessage = (notification: AppNotification) => (
  notification.message
    .replace(/^Recibes esta notificacion para confirmar que la accion se guardo correctamente\.?\s*/i, '')
    .replace(/^Recibiste esta notificacion porque\s*/i, '')
    .trim()
);

const shouldShowReason = (reason?: string | null) => {
  if (!reason) return false;
  const normalized = reason.toLowerCase();
  return !normalized.includes('confirmar que la accion se guardo') && !normalized.includes('recibes esta notificacion');
};

const NotificationsMobileOverlay: React.FC<NotificationsMobileOverlayProps> = ({
  onClose,
  onOpenCard,
  onNotificationsChanged,
}) => {
  const [scope, setScope] = useState<NotificationScope>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const criticalCount = useMemo(
    () => notifications.filter((notification) => notification.priority === 'critical').length,
    [notifications]
  );

  const loadNotifications = useCallback(async (selectedScope: NotificationScope = scope, showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await vortexApi.getNotifications(selectedScope);
      setNotifications(data);
    } catch {
      setError('No se pudieron cargar las notificaciones reales.');
      setNotifications([]);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [scope]);

  useEffect(() => {
    loadNotifications(scope);
  }, [loadNotifications, scope]);

  useEffect(() => {
    const stream = new EventSource(vortexApi.getEventsStreamUrl(), { withCredentials: true });
    const refreshNotifications = () => {
      loadNotifications(scope, false);
      onNotificationsChanged?.();
    };

    stream.addEventListener('notification_created', refreshNotifications);
    stream.addEventListener('notification_updated', refreshNotifications);

    return () => {
      stream.removeEventListener('notification_created', refreshNotifications);
      stream.removeEventListener('notification_updated', refreshNotifications);
      stream.close();
    };
  }, [loadNotifications, onNotificationsChanged, scope]);

  const replaceNotification = (updated: AppNotification) => {
    setNotifications((current) => {
      if (updated.resolved || updated.snoozedUntil) {
        return current.filter((notification) => notification.id !== updated.id);
      }
      return current.map((notification) => notification.id === updated.id ? updated : notification);
    });
    onNotificationsChanged?.();
  };

  const handleMarkAllRead = async () => {
    setWorkingId('all');
    try {
      await vortexApi.markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      onNotificationsChanged?.();
    } catch {
      setError('No se pudieron marcar como leidas.');
    } finally {
      setWorkingId(null);
    }
  };

  const executeAction = async (notification: AppNotification, action: string) => {
    setWorkingId(`${notification.id}:${action}`);
    setError(null);

    try {
      if (action === 'snooze_24h') {
        const updated = await vortexApi.snoozeNotification24h(notification.id);
        replaceNotification(updated);
        return;
      }

      const updated = action === 'open_card'
        ? await vortexApi.executeNotificationAction(notification.id, action)
        : await vortexApi.executeNotificationAction(notification.id, action);

      replaceNotification(updated);

      if (action === 'open_card') {
        onOpenCard?.(updated);
      }
    } catch {
      setError('La accion no se pudo completar en el servidor.');
    } finally {
      setWorkingId(null);
    }
  };

  const handleCardClick = async (notification: AppNotification) => {
    if (notification.cardId && notification.suggestedActions.includes('open_card')) {
      await executeAction(notification, 'open_card');
      return;
    }

    if (!notification.read) {
      setWorkingId(`${notification.id}:read`);
      try {
        const updated = await vortexApi.markNotificationRead(notification.id);
        replaceNotification(updated);
      } catch {
        setError('No se pudo marcar como leida.');
      } finally {
        setWorkingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 animate-fade-in flex flex-col md:items-end">
      <button
        type="button"
        aria-label="Cerrar notificaciones"
        onClick={onClose}
        className="hidden md:block absolute inset-0 cursor-default"
      />

      <section className="relative z-10 w-full h-full md:max-w-[480px] md:border-l md:border-neutral-800 bg-[#111113] flex flex-col shadow-2xl">
        <div className="px-5 pt-4 pb-3 border-b border-neutral-800/70">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-100">Notificaciones</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-200 ring-1 ring-blue-500/25">
                    {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 truncate">
                {criticalCount > 0 ? `${criticalCount} urgente${criticalCount > 1 ? 's' : ''}` : 'Actividad del tablero en tiempo real'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => loadNotifications(scope)}
                className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
                title="Actualizar"
                disabled={isLoading}
              >
                <i className={`fa-solid fa-rotate-right text-xs ${isLoading ? 'animate-spin' : ''}`}></i>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
                title="Cerrar"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded border border-neutral-800 bg-[#171719] p-0.5">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${scope === 'all' ? 'bg-[#26262a] text-neutral-100 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setScope('unread')}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${scope === 'unread' ? 'bg-[#26262a] text-neutral-100 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Sin leer
              </button>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || workingId === 'all'}
              className="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-100 disabled:text-neutral-700 disabled:hover:bg-transparent transition-colors"
            >
              <i className="fa-solid fa-check-double text-[11px]"></i>
              <span>Marcar leidas</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-4 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-3">
              <i className="fa-solid fa-circle-notch text-2xl animate-spin"></i>
              <span className="text-sm">Cargando actividad...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-14 h-14 rounded-full bg-neutral-800/70 ring-1 ring-neutral-700/70 flex items-center justify-center mb-4">
                <i className="fa-regular fa-bell-slash text-2xl text-neutral-600"></i>
              </div>
              <h3 className="text-sm font-semibold text-neutral-300 mb-1">No hay notificaciones</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Aqui apareceran asignaciones, riesgos, movimientos e invitaciones del tablero.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80">
              {notifications.map((notification) => {
                const priorityClass = priorityClasses[notification.priority] || priorityClasses.info;
                const priorityLabel = priorityLabels[notification.priority] || notification.priority;
                const visual = visualByNotification(notification);
                const ticketNumber = getTicketNumber(notification);
                const readableMessage = getReadableMessage(notification);
                const actorLabel = getActorLabel(notification);
                const visibleActions = notification.suggestedActions
                  .filter((action) => action !== 'open_card' && action !== 'dismiss')
                  .slice(0, 2);
                const canDismiss = notification.suggestedActions.includes('dismiss');

                return (
                  <article
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(notification)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleCardClick(notification);
                      }
                    }}
                    className={`group relative cursor-pointer outline-none transition-colors focus-visible:bg-neutral-800/70 ${notification.read ? 'bg-[#111113] hover:bg-[#171719]' : `bg-gradient-to-r ${visual.accent} to-transparent hover:bg-[#19191c]`}`}
                  >
                    {!notification.read && (
                      <span className={`absolute left-0 top-0 bottom-0 w-0.5 ${visual.bar}`} />
                    )}

                    <div className="flex gap-3 px-5 py-3.5 pr-4">
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <span className={`w-8 h-8 rounded-md ring-1 flex items-center justify-center ${visual.iconBox}`}>
                          <i className={`${visual.icon} text-xs`}></i>
                        </span>
                        {!notification.read && (
                          <span className={`w-1.5 h-1.5 rounded-full shadow ${visual.dot}`} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                              <span className="truncate">{actorLabel}</span>
                              <span className="w-1 h-1 rounded-full bg-neutral-700 flex-shrink-0"></span>
                              <span className="whitespace-nowrap">{formatNotificationTime(notification.createdAt)}</span>
                            </div>

                            <h3 className={`mt-0.5 text-sm leading-snug ${notification.read ? 'font-medium text-neutral-300' : 'font-semibold text-neutral-100'}`}>
                              {ticketNumber && <span className="text-blue-200">{ticketNumber} </span>}
                              {notification.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${priorityClass}`}>
                              {priorityLabel}
                            </span>
                            {canDismiss && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  executeAction(notification, 'dismiss');
                                }}
                                disabled={workingId === `${notification.id}:dismiss`}
                                className="w-7 h-7 flex items-center justify-center rounded text-neutral-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-40 transition-all"
                                title="Descartar"
                              >
                                <i className="fa-solid fa-xmark text-xs"></i>
                              </button>
                            )}
                          </div>
                        </div>

                        {readableMessage && (
                          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                            {readableMessage}
                          </p>
                        )}

                        {shouldShowReason(notification.reason) && (
                          <p className="mt-1 text-[11px] leading-snug text-neutral-600">
                            {notification.reason}
                          </p>
                        )}

                        {visibleActions.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                            {visibleActions.map((action) => (
                              <button
                                key={action}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  executeAction(notification, action);
                                }}
                                disabled={workingId === `${notification.id}:${action}`}
                                className="flex items-center gap-1.5 rounded border border-neutral-700/70 bg-[#18181b] px-2 py-1 text-[11px] font-medium text-neutral-300 hover:border-blue-500/40 hover:text-blue-100 disabled:opacity-50 transition-colors"
                              >
                                <i className={`${actionIcons[action] || 'fa-solid fa-bolt'} text-[10px]`}></i>
                                <span>{workingId === `${notification.id}:${action}` ? '...' : actionLabels[action] || action}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-neutral-800/70 bg-[#141416] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 text-xs font-semibold hover:text-neutral-300 transition-colors"
          >
            Volver al tablero
          </button>
        </div>
      </section>
    </div>
  );
};

export default NotificationsMobileOverlay;
