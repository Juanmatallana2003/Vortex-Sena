"use client";


import React, { useEffect, useRef, useState } from 'react';
import { FilterState, Tag, Column } from '../types';
import Avatar from './Avatar';
import TagPill from './TagPill';

interface FilterMenuProps {
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableTags: Tag[];
  availableAssignees: string[];
  columns: Column[];
  triggerRef?: React.RefObject<HTMLElement | null>;
}

type TabType = 'status' | 'people' | 'labels';

const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const FilterMenu: React.FC<FilterMenuProps> = ({
  onClose,
  filters,
  onFilterChange,
  availableTags,
  availableAssignees,
  columns,
  triggerRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  const toggleStatus = (statusId: string) => {
    const newStatuses = filters.statuses.includes(statusId)
      ? filters.statuses.filter((s) => s !== statusId)
      : [...filters.statuses, statusId];
    onFilterChange({ ...filters, statuses: newStatuses });
  };

  const toggleTag = (tagLabel: string) => {
    const newTags = filters.tags.includes(tagLabel)
      ? filters.tags.filter((t) => t !== tagLabel)
      : [...filters.tags, tagLabel];
    onFilterChange({ ...filters, tags: newTags });
  };

  const toggleAssignee = (assignee: string) => {
    const newAssignees = filters.assignees.includes(assignee)
      ? filters.assignees.filter((a) => a !== assignee)
      : [...filters.assignees, assignee];
    onFilterChange({ ...filters, assignees: newAssignees });
  };

  const filteredStatuses = columns.filter(col => 
    col.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = availableTags.filter(tag => 
    tag.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAssignees = availableAssignees.filter((assignee) =>
    assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    onFilterChange({
      tags: [],
      statuses: [],
      assignees: [],
    });
  };

  const activeFilterCount = filters.tags.length + filters.statuses.length + filters.assignees.length;

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-[360px] bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
      style={{ transformOrigin: 'top right' }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <i className="fa-solid fa-filter text-blue-600 dark:text-blue-400 text-sm"></i>
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button 
            onClick={clearFilters}
            className="text-xs text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative group">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs transition-colors group-focus-within:text-blue-500"></i>
          <input 
            type="text" 
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#111113] border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-4 gap-1">
        {(['status', 'people', 'labels'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-xs font-medium transition-colors relative rounded-t-lg capitalize flex items-center justify-center gap-1.5",
              activeTab === tab 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {tab === 'status' && <i className="fa-solid fa-list text-xs"></i>}
            {tab === 'people' && <i className="fa-regular fa-user text-xs"></i>}
            {tab === 'labels' && <i className="fa-solid fa-tag text-xs"></i>}
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto min-h-[260px] max-h-[380px] p-2 custom-scrollbar relative bg-white dark:bg-[#1c1c1f]">
        {activeTab === 'status' && (
          <div className="space-y-1">
              {filteredStatuses.map((column) => {
                const isSelected = filters.statuses.includes(column.id);
                return (
                  <button
                    key={column.id}
                    onClick={() => toggleStatus(column.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group border border-transparent",
                      isSelected 
                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" 
                        : "hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-transform duration-200",
                      column.color,
                      isSelected ? "scale-125 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-[#1c1c1f] ring-current" : ""
                    )}></div>
                    <span className={cn(
                      "text-sm transition-colors duration-200",
                      isSelected ? "text-neutral-900 dark:text-neutral-100 font-medium" : "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-300"
                    )}>
                      {column.title}
                    </span>
                    {isSelected && (
                      <div className="ml-auto bg-blue-600 dark:bg-blue-500 text-white rounded-full px-1 text-[10px]">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="space-y-1">
              {filteredAssignees.length > 0 ? filteredAssignees.map((assignee, idx) => {
                const isSelected = filters.assignees.includes(assignee);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleAssignee(assignee)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group border border-transparent",
                      isSelected 
                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" 
                        : "hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                    )}
                  >
                    <div className={cn("transition-transform duration-200", isSelected ? "scale-105" : "")}>
                      <Avatar src={assignee} alt="User" />
                    </div>
                    <span className={cn(
                      "text-sm transition-colors duration-200",
                      isSelected ? "text-neutral-900 dark:text-neutral-100 font-medium" : "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-300"
                    )}>
                      User {idx + 1}
                    </span>
                    {isSelected && (
                      <div className="ml-auto bg-blue-600 dark:bg-blue-500 text-white rounded-full px-1 text-[10px]">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    )}
                  </button>
                );
              }) : (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600">
                  <i className="fa-regular fa-user text-2xl mb-2 opacity-20"></i>
                  <span className="text-xs italic">No people found</span>
                </div>
              )}
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="flex flex-wrap gap-2 p-2">
              {filteredTags.length > 0 ? filteredTags.map((tag) => {
                const isSelected = filters.tags.includes(tag.label);
                return (
                  <button
                    key={tag.label}
                    onClick={() => toggleTag(tag.label)}
                    className={cn(
                      "transition-all duration-200 rounded-full relative",
                      isSelected 
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-[#1c1c1f]" 
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <TagPill tag={tag} />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full px-1 text-[10px] shadow-sm z-10">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    )}
                  </button>
                );
              }) : (
                <div className="w-full py-12 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600">
                  <i className="fa-solid fa-tag text-2xl mb-2 opacity-20"></i>
                  <span className="text-xs italic">No labels found</span>
                </div>
              )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="py-3 border-t border-neutral-100 dark:border-neutral-800/50 bg-gray-50/50 dark:bg-[#161618]/50 text-center backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-semibold">Press Esc to close</p>
      </div>
    </div>
  );
};

export default FilterMenu;


