"use client";


import React, { useState, useMemo } from 'react';
import { ChangeLogEntry } from '../types';
import Avatar from './Avatar';

interface HistoryModalProps {
  onClose: () => void;
  history: ChangeLogEntry[];
  onOpenCard: (cardId: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, history, onOpenCard }) => {
  const [selectedEntry, setSelectedEntry] = useState<ChangeLogEntry | null>(null);

  // Group data by Date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, ChangeLogEntry[]> = {};
    
    history.forEach(entry => {
      const dateObj = new Date(entry.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (dateObj.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(entry);
    });

    return groups;
  }, [history]);

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111113] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-scale-in relative overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
        onClick={handleModalContentClick}
      >
        <header className="flex items-center justify-between px-8 py-6 z-10">
          <div>
              <h1 className="text-xl font-light text-neutral-900 dark:text-neutral-100 tracking-tight">Project Timeline</h1>
              <p className="text-xs text-neutral-500 mt-1">Visual history of events</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-neutral-800/50 hover:bg-gray-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
             <div className="flex flex-col items-center w-full pb-20 pt-4">
                {(Object.entries(groupedHistory) as [string, ChangeLogEntry[]][]).map(([dateLabel, entries], groupIndex) => (
                   <div key={dateLabel} className="flex flex-col items-center w-full relative">
                      
                      {/* Connecting line from previous group */}
                      {groupIndex > 0 && (
                        <div className="h-16 w-px bg-neutral-300 dark:bg-neutral-600"></div>
                      )}

                      {/* Date Node (Minimalist Pill) */}
                      <div className="z-10 flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 mb-2 shadow-sm">
                         <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">{dateLabel}</span>
                         <div className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500"></div>
                         <span className="text-xs text-neutral-500 dark:text-neutral-400">{entries.length} events</span>
                      </div>

                      {/* Vertical line from Date to Bus */}
                      <div className="h-10 w-px bg-neutral-300 dark:bg-neutral-600"></div>

                      {/* Children Container */}
                      <div className="flex justify-center gap-6 w-full">
                          {entries.map((entry, index) => {
                            const isFirst = index === 0;
                            const isLast = index === entries.length - 1;
                            
                            return (
                                <div key={entry.id} className="flex flex-col items-center relative">
                                    {/* Horizontal Bus Lines (More Visible) */}
                                    <div className="absolute top-0 left-0 right-0 h-px">
                                        {!isFirst && (
                                            <div className="absolute top-0 left-0 w-[50%] h-px bg-neutral-300 dark:bg-neutral-600"></div>
                                        )}
                                        {!isLast && (
                                            <div className="absolute top-0 right-0 w-[50%] h-px bg-neutral-300 dark:bg-neutral-600"></div>
                                        )}
                                    </div>

                                    {/* Vertical Stem */}
                                    <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-600"></div>

                                    {/* Card (Modern & Minimal) */}
                                    <div 
                                        className="w-40 cursor-pointer group"
                                        onClick={() => setSelectedEntry(entry)}
                                    >
                                        <div className="relative bg-gray-50 dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-white dark:hover:bg-[#1c1c1f] rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/50">
                                            
                                            {/* Status Dot (Subtle) */}
                                            <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${entry.type === 'automatic' ? 'bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>

                                            <div className="mb-3 relative">
                                                <img 
                                                    src={entry.user.avatar} 
                                                    alt={entry.user.name} 
                                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-[#161618] group-hover:ring-gray-100 dark:group-hover:ring-[#1c1c1f] transition-all grayscale-[0.3] group-hover:grayscale-0"
                                                />
                                            </div>
                                            
                                            <span className="text-[10px] text-neutral-500 font-mono mb-2 tracking-wide">
                                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed line-clamp-3 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
                                                {entry.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                          })}
                      </div>
                   </div>
                ))}
             </div>
        </div>

        {/* Detail Sidebar (Modern) */}
        {selectedEntry && (
            <div className="absolute top-0 right-0 bottom-0 z-20 w-[400px] bg-white/95 dark:bg-[#161618]/95 backdrop-blur-xl border-l border-neutral-200 dark:border-neutral-800 shadow-2xl p-8 animate-slide-left flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                 <div className="flex items-center justify-end mb-6">
                    <button onClick={() => setSelectedEntry(null)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <img src={selectedEntry.user.avatar} alt={selectedEntry.user.name} className="w-16 h-16 rounded-full object-cover mb-4 ring-4 ring-gray-100 dark:ring-[#1c1c1f]" />
                        <div className={`absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 flex items-center justify-center`}>
                             <i className={`text-[10px] ${selectedEntry.type === 'automatic' ? 'fa-solid fa-robot text-blue-500 dark:text-blue-400' : 'fa-solid fa-user text-orange-500 dark:text-orange-400'}`}></i>
                        </div>
                    </div>
                    <h2 className="text-lg font-medium text-neutral-900 dark:text-white">{selectedEntry.user.name}</h2>
                    <p className="text-sm text-neutral-500">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Action</span>
                        <p className="text-neutral-700 dark:text-neutral-200 text-lg font-light leading-normal">
                            {selectedEntry.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                         <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Details</span>
                         <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1c1c1f] border border-neutral-200 dark:border-white/5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {selectedEntry.details}
                         </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Type</span>
                        <div className="flex">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedEntry.type === 'automatic' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30 text-orange-600 dark:text-orange-400'}`}>
                                {selectedEntry.type === 'automatic' ? 'System Automation' : 'Manual Action'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={() => selectedEntry.cardId && onOpenCard(selectedEntry.cardId)}
                        disabled={!selectedEntry.cardId}
                        className="w-full py-3 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/5 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Open Related Issue
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;

