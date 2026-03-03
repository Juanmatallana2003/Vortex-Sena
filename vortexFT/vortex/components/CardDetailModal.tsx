"use client";


import React, { useState, useEffect, useRef } from 'react';
import { Card, Tag } from '../types';
import Avatar from './Avatar';
import TagPill from './TagPill';
import { ALL_TAGS, ALL_USERS } from '../constants';

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete: (cardId: string) => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onUpdate, onDelete }) => {

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [assignees, setAssignees] = useState<string[]>(card.assignees || []);
  const [tags, setTags] = useState<Tag[]>(card.tags || []);
  const [dueDate, setDueDate] = useState(card.dueDate || '');

  // Dropdown states
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  
  const assigneeRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
              setIsAssigneeOpen(false);
          }
          if (tagRef.current && !tagRef.current.contains(event.target as Node)) {
              setIsTagsOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSave = () => {
      const updatedCard: Card = {
          ...card,
          title: title.trim(),
          description: description.trim(),
          assignees,
          tags,
          dueDate: dueDate || undefined,
      };
      onUpdate(updatedCard);
  };

  const handleDelete = () => {
      onDelete(card.id);
  };

  // Toggle helpers
  const toggleAssignee = (avatarUrl: string) => {
      setAssignees(prev => 
        prev.includes(avatarUrl) 
            ? prev.filter(a => a !== avatarUrl) 
            : [...prev, avatarUrl]
      );
  };

  const toggleTag = (tag: Tag) => {
      setTags(prev => {
          const exists = prev.some(t => t.label === tag.label);
          if (exists) return prev.filter(t => t.label !== tag.label);
          return [...prev, tag];
      });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-title"
    >
      <div 
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in shadow-2xl"
        onClick={handleModalContentClick}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 font-mono text-sm bg-gray-100 dark:bg-neutral-800/50 px-2 py-1 rounded">#{card.number}</span>
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Issue Details</span>
          </div>
          <div className="flex items-center gap-4">
              <button 
                onClick={handleDelete}
                className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-trash-can mr-2"></i>
                Delete
              </button>
              <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800"></div>
              <button 
                onClick={onClose} 
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Close"
              >
                <i className="fa-solid fa-times text-lg"></i>
              </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Main Content (Left) */}
            <div className="flex-1 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800">
                <div className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-xl font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 border-none outline-none focus:ring-0 p-0"
                            placeholder="Issue Title"
                        />
                    </div>

                    {/* Description Textarea */}
                    <div>
                         <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                             Description
                         </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-64 bg-gray-50 dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-900/20 transition-all resize-none leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                            placeholder="Add a more detailed description..."
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar (Right) */}
            <div className="w-full md:w-80 bg-gray-50/50 dark:bg-[#161618]/50 p-6 overflow-y-auto space-y-8 flex-shrink-0">
                
                {/* Assignees */}
                <div className="relative" ref={assigneeRef}>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Assignees</label>
                        <button 
                            onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                            className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <i className="fa-solid fa-gear"></i>
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {assignees.map((assignee, index) => (
                             <div key={index} className="relative group">
                                <Avatar src={assignee} alt="Assignee" />
                                <button 
                                    onClick={() => toggleAssignee(assignee)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-white dark:bg-neutral-800 rounded-full text-xs text-neutral-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:scale-125 transition-all border border-neutral-200 dark:border-neutral-600 shadow-sm"
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>
                             </div>
                        ))}
                        {assignees.length === 0 && <span className="text-sm text-neutral-500 dark:text-neutral-600 italic">No one assigned</span>}
                    </div>

                    {/* Assignee Dropdown */}
                    {isAssigneeOpen && (
                        <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 animate-scale-in overflow-hidden">
                            <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">Select Assignee</div>
                            <div className="max-h-48 overflow-y-auto p-1">
                                {ALL_USERS.map((user) => {
                                    const isSelected = assignees.includes(user.avatar);
                                    return (
                                        <button 
                                            key={user.name}
                                            onClick={() => toggleAssignee(user.avatar)}
                                            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-left"
                                        >
                                            <Avatar src={user.avatar} alt={user.name} />
                                            <span className={`text-sm flex-1 ${isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}>{user.name}</span>
                                            {isSelected && <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Labels/Tags */}
                <div className="relative" ref={tagRef}>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Labels</label>
                        <button 
                            onClick={() => setIsTagsOpen(!isTagsOpen)}
                            className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <i className="fa-solid fa-gear"></i>
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {tags.map((tag, index) => (
                            <div key={index} className="relative group cursor-pointer">
                                <TagPill tag={tag} />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTag(tag);
                                    }}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-white dark:bg-neutral-800 rounded-full text-xs text-neutral-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:scale-125 transition-all border border-neutral-200 dark:border-neutral-600 shadow-sm"
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            </div>
                        ))}
                        {tags.length === 0 && <span className="text-sm text-neutral-500 dark:text-neutral-600 italic">No labels</span>}
                    </div>

                    {/* Tags Dropdown */}
                    {isTagsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 animate-scale-in overflow-hidden">
                            <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">Apply Labels</div>
                            <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                                {ALL_TAGS.map((tag) => {
                                    const isSelected = tags.some(t => t.label === tag.label);
                                    return (
                                        <button 
                                            key={tag.label}
                                            onClick={() => toggleTag(tag)}
                                            className="flex items-center justify-between w-full p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors group"
                                        >
                                           <TagPill tag={tag} />
                                           {isSelected && <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs mr-1"></i>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Due Date */}
                <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Due Date</label>
                    <div className="flex items-center gap-2 bg-white dark:bg-[#0e0e10] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group focus-within:ring-1 focus-within:ring-blue-500">
                        <i className="fa-regular fa-calendar text-neutral-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"></i>
                        <input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-transparent text-neutral-700 dark:text-neutral-300 text-sm w-full outline-none border-none cursor-pointer placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                            style={{ colorScheme: 'light dark' }}
                        />
                    </div>
                </div>

            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#1c1c1f] rounded-b-xl">
             <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors font-medium"
             >
                 Cancel
             </button>
             <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
             >
                 Save Changes
             </button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;

