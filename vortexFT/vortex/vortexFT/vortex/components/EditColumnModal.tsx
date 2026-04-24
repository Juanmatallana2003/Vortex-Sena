"use client";


import React, { useState } from 'react';
import { Column } from '../types';

interface EditColumnModalProps {
  column: Column;
  onClose: () => void;
  onSave: (updatedColumn: Column) => void;
}

const COLORS = [
  { label: 'Gray', value: 'bg-neutral-500' },
  { label: 'Blue', value: 'bg-blue-400' },
  { label: 'Yellow', value: 'bg-yellow-400' },
  { label: 'Purple', value: 'bg-purple-400' },
  { label: 'Green', value: 'bg-green-400' },
  { label: 'Red', value: 'bg-red-400' },
  { label: 'Orange', value: 'bg-orange-400' },
  { label: 'Pink', value: 'bg-pink-400' },
];

const EditColumnModal: React.FC<EditColumnModalProps> = ({ column, onClose, onSave }) => {
  const [title, setTitle] = useState(column.title);
  const [keyword, setKeyword] = useState(column.keyword);
  const [selectedColor, setSelectedColor] = useState(column.color);
  const [isDoneColumn, setIsDoneColumn] = useState(column.isDoneColumn || false);

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        ...column,
        title: title.trim(),
        keyword: keyword.trim(),
        color: selectedColor,
        isDoneColumn: isDoneColumn,
      });
      onClose();
    }
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-column-title"
    >
      <div
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-lg w-full max-w-sm flex flex-col animate-scale-in"
        onClick={handleModalContentClick}
      >
        <header className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 id="edit-column-title" className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Edit Column</h1>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="Close"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </header>
        <div className="p-6 space-y-4">
          
          {/* Title Input */}
          <div>
            <label htmlFor="column-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Title</label>
            <input
              type="text"
              id="column-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Keyword Input */}
          <div>
            <label htmlFor="column-keyword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Keyword / Key</label>
            <input
              type="text"
              id="column-keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. todo, fixed, backlog"
              className="w-full bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Used for filtering and API references.</p>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-6 h-6 rounded-full ${c.value} transition-transform ${selectedColor === c.value ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-[#1c1c1f] scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                  aria-label={`Select ${c.label}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Is Done Column Checkbox */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 mt-4">
            <label className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-gray-100 dark:hover:bg-neutral-800/50 rounded-lg transition-colors">
               <div className="relative flex items-center mt-0.5">
                   <input 
                       type="checkbox" 
                       checked={isDoneColumn}
                       onChange={(e) => setIsDoneColumn(e.target.checked)}
                       className="peer sr-only"
                   />
                   <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
               </div>
               <div className="flex flex-col flex-1">
                   <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                       Mark as Done
                   </span>
                   <div className="flex items-start gap-2 mt-1.5 text-[10px] text-neutral-500 leading-tight">
                        <i className="fa-solid fa-circle-exclamation text-yellow-500 flex-shrink-0 mt-0.5"></i>
                        <span>Esta opción define la columna como finalizado, las tarjetas o issues en este cerrarán el issue en github de manera automática.</span>
                   </div>
               </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-[#27272a] border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 bg-blue-600 border border-blue-500 rounded-md hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditColumnModal;
