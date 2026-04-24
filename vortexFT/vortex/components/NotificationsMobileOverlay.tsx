import React, { useMemo } from 'react';
import Avatar from './Avatar';
import { AppNotification, NotificationAction } from '@/types';

interface NotificationsMobileOverlayProps {
  onClose: () => void;
  notifications: AppNotification[];
  focusNotifications: AppNotification[];
  unreadCount: number;
  isLoading?: boolean;
  scope: 'all' | 'unread';
  onScopeChange: (scope: 'all' | 'unread') => void;
  onMarkAllRead: () => void;
  onMarkRead: (notificationId: string) => void;
  onAction: (notificationId: string, action: NotificationAction) => void;
  onOpenCard: (workspaceId: string | null | undefined, cardId: string | null | undefined) => void;
  mode?: 'mobile' | 'desktop';
}

const priorityStyles: Record<string, { badge: string; dot: string; label: string }> = {
  critical: {
    badge: 'border-red-500/35 bg-red-500/12 text-red-300',
    dot: 'bg-red-400',
    label: 'Critica'
  },
  important: {
    badge: 'border-amber-500/35 bg-amber-500/12 text-amber-200',
    dot: 'bg-amber-300',
    label: 'Importante'
  },
  info: {
    badge: 'border-sky-500/35 bg-sky-500/12 text-sky-200',
    dot: 'bg-sky-300',
    label: 'Info'
  }
};

const actionLabels: Record<NotificationAction, string> = {
  open_card: 'Abrir',
  dismiss: 'Descartar',
  assign_me: 'Asignarme',
  start_now: 'Empezar',
  mark_done: 'Completar',
  snooze_24h: 'Posponer 24h'
};

const focusCardStyle = (priority: string) => {
  if (priority === 'critical') return 'border-red-500/35 bg-red-500/8';
  if (priority === 'important') return 'border-amber-500/35 bg-amber-500/8';
  return 'border-sky-500/35 bg-sky-500/8';
};

const formatRelativeTime = (isoDate?: string) => {
  if (!isoDate) return 'Ahora';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Ahora';

  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / (1000 * 60));

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  const absMinutes = Math.abs(minutes);
  if (absMinutes < 60) return rtf.format(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');

  const days = Math.round(hours / 24);
  return rtf.format(days, 'day');
};

const NotificationsMobileOverlay: React.FC<NotificationsMobileOverlayProps> = ({
  onClose,
  notifications,
  focusNotifications,
  unreadCount,
  isLoading = false,
  scope,
  onScopeChange,
  onMarkAllRead,
  onMarkRead,
  onAction,
  onOpenCard,
  mode = 'mobile'
}) => {
  const isMobile = mode === 'mobile';

  const containerClass = isMobile
    ? 'fixed inset-0 z-[100] bg-[#111113] animate-fade-in flex flex-col md:hidden'
    : 'absolute left-3 top-3 z-[80] w-[440px] max-w-[calc(100vw-2rem)] h-[min(82vh,760px)] rounded-2xl border border-neutral-800 bg-[#111113] shadow-2xl flex flex-col animate-slide-in-left origin-top-left';

  const visibleNotifications = useMemo(
    () => (scope === 'unread' ? notifications.filter((item) => !item.read && !item.resolved) : notifications),
    [notifications, scope]
  );

  return (
    <div className={containerClass}>
      <div className='flex items-center justify-between px-5 py-4 border-b border-neutral-800/70'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base md:text-lg font-semibold text-neutral-100'>Notificaciones</h2>
          <span className='rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-200'>
            {unreadCount} sin leer
          </span>
        </div>
        <button
          onClick={onClose}
          className='h-9 w-9 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-100 transition-colors'
          aria-label='Cerrar notificaciones'
        >
          <i className='fa-solid fa-xmark'></i>
        </button>
      </div>

      <div className='px-5 py-3 border-b border-neutral-800/40 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onScopeChange('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              scope === 'all' ? 'bg-neutral-100 text-neutral-900 border-neutral-100' : 'bg-transparent border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => onScopeChange('unread')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              scope === 'unread' ? 'bg-sky-400 text-slate-950 border-sky-400' : 'bg-transparent border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sin leer
          </button>
        </div>
        <button
          onClick={onMarkAllRead}
          className='text-xs font-semibold text-sky-300 hover:text-sky-200 disabled:text-neutral-600 transition-colors'
          disabled={unreadCount === 0}
        >
          Marcar todas
        </button>
      </div>

      {focusNotifications.length > 0 && (
        <div className='px-5 py-3 border-b border-neutral-800/40'>
          <p className='text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2'>Foco sugerido</p>
          <div className='grid grid-cols-1 gap-2'>
            {focusNotifications.slice(0, 3).map((item) => (
              <button
                key={`focus-${item.id}`}
                type='button'
                className={`text-left w-full rounded-xl border px-3 py-2 transition-colors hover:border-neutral-500 ${focusCardStyle(item.priority)}`}
                onClick={() => onOpenCard(item.workspaceId, item.cardId)}
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-sm font-semibold text-neutral-100 truncate'>{item.title}</span>
                  <span className='text-[10px] text-neutral-400'>{formatRelativeTime(item.createdAt)}</span>
                </div>
                <p className='text-xs text-neutral-300 truncate mt-0.5'>{item.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className='flex-1 overflow-y-auto p-4'>
        {isLoading ? (
          <div className='h-full flex items-center justify-center text-neutral-400 text-sm'>Cargando notificaciones...</div>
        ) : visibleNotifications.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center text-center px-6'>
            <div className='w-16 h-16 rounded-2xl border border-neutral-700 bg-neutral-900/70 flex items-center justify-center text-neutral-500 mb-3'>
              <i className='fa-regular fa-bell-slash text-xl'></i>
            </div>
            <p className='text-sm font-semibold text-neutral-200'>Tu inbox esta al dia</p>
            <p className='text-xs text-neutral-500 mt-1'>Cuando haya cambios relevantes en tareas y espacios, apareceran aqui.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {visibleNotifications.map((item) => {
              const style = priorityStyles[item.priority] || priorityStyles.info;
              const canOpenCard = Boolean(item.cardId);

              return (
                <article
                  key={item.id}
                  className={`rounded-2xl border px-3.5 py-3 transition-colors ${
                    item.read ? 'bg-[#151518] border-neutral-800' : 'bg-[#1a1a1e] border-neutral-700 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div className='relative mt-0.5'>
                      <Avatar src={item.actorAvatar || undefined} alt={item.actorName || item.actorLogin || 'Usuario'} sizeClass='w-10 h-10' className='border-neutral-700' />
                      {!item.read && <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1a1e] ${style.dot}`}></span>}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                          <h3 className='text-sm font-semibold text-neutral-100 truncate'>{item.title}</h3>
                          <p className='text-[12px] text-neutral-400 truncate'>{item.actorName || item.actorLogin || 'Vortex'}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>{style.label}</span>
                      </div>

                      <p className='text-[13px] text-neutral-200 leading-relaxed mt-2'>{item.message}</p>
                      {item.reason && <p className='text-[11px] text-neutral-500 mt-1'>{item.reason}</p>}

                      <div className='flex items-center justify-between gap-2 mt-3'>
                        <span className='text-[11px] text-neutral-500'>{formatRelativeTime(item.createdAt)}</span>
                        <div className='flex items-center gap-1 flex-wrap justify-end'>
                          {!item.read && (
                            <button
                              type='button'
                              className='rounded-full border border-neutral-700 px-2 py-1 text-[10px] font-semibold text-neutral-300 hover:border-neutral-500 hover:text-neutral-100 transition-colors'
                              onClick={() => onMarkRead(item.id)}
                            >
                              Leida
                            </button>
                          )}

                          {item.suggestedActions.slice(0, 3).map((action) => (
                            <button
                              key={`${item.id}-${action}`}
                              type='button'
                              className='rounded-full border border-neutral-700 px-2 py-1 text-[10px] font-semibold text-neutral-200 hover:border-sky-400/60 hover:text-sky-200 transition-colors'
                              onClick={() => {
                                if (action === 'open_card' && canOpenCard) {
                                  onOpenCard(item.workspaceId, item.cardId);
                                }
                                onAction(item.id, action);
                              }}
                            >
                              {actionLabels[action] || action}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsMobileOverlay;


