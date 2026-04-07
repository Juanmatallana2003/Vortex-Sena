
import React from 'react';

interface NotificationsMobileOverlayProps {
  onClose: () => void;
}

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'mention', user: 'Alex Johnson', action: 'mentioned you in', target: 'Issue #45', time: '2h ago', read: false, avatar: 'https://i.pravatar.cc/150?u=a' },
  { id: 2, type: 'review', user: 'Maria Garcia', action: 'requested review on', target: 'PR #102: Landing Page', time: '5h ago', read: false, avatar: 'https://i.pravatar.cc/150?u=b' },
  { id: 3, type: 'assign', user: 'James Smith', action: 'assigned you to', target: 'Bug #39: Fix login crash', time: '1d ago', read: true, avatar: 'https://i.pravatar.cc/150?u=c' },
  { id: 4, type: 'system', user: 'Vortex Bot', action: 'deployed', target: 'vortex-api to staging', time: '2d ago', read: true, avatar: 'https://ui-avatars.com/api/?name=Bot&background=0D8ABC&color=fff' },
];

const NotificationsMobileOverlay: React.FC<NotificationsMobileOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#111113] animate-fade-in flex flex-col md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50">
        <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-100">Inbox</h2>
            <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-900/50">2 New</span>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800/50 text-neutral-400"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      {/* Tabs (Simple) */}
      <div className="px-6 py-3 flex gap-4 border-b border-neutral-800/30">
          <button className="text-sm font-medium text-neutral-200 border-b-2 border-blue-500 pb-1">All</button>
          <button className="text-sm font-medium text-neutral-500 pb-1">Unread</button>
          <button className="text-sm font-medium text-neutral-500 pb-1">Mentioned</button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-3">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div 
                key={notif.id}
                className={`flex gap-4 p-4 rounded-2xl border transition-all ${notif.read ? 'bg-[#161618] border-neutral-800' : 'bg-[#1c1c1f] border-neutral-700 shadow-lg'}`}
            >
                <div className="relative flex-shrink-0">
                    <img src={notif.avatar} alt={notif.user} className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                    {!notif.read && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#1c1c1f]"></div>}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                         <span className="text-sm font-medium text-neutral-200 truncate">{notif.user}</span>
                         <span className="text-[10px] text-neutral-500 whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-0.5 leading-snug">
                        {notif.action} <span className="text-blue-400 font-medium">{notif.target}</span>
                    </p>
                </div>
            </div>
          ))}
          
          <div className="py-8 flex flex-col items-center justify-center text-neutral-600">
             <i className="fa-regular fa-bell-slash text-2xl mb-2 opacity-50"></i>
             <span className="text-xs">No more notifications</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-800/50 text-center bg-[#161618]">
        <button 
          onClick={onClose}
          className="text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-neutral-300 transition-colors"
        >
          Close Inbox
        </button>
      </div>
    </div>
  );
};

export default NotificationsMobileOverlay;
