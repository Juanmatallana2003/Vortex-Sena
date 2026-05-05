"use client";


import React, { useState } from 'react';
import { Column } from '../types';

interface EditColumnModalProps {
  column: Column;
  onClose: () => void;
  onSave: (updatedColumn: Column) => void | Promise<void>;
  onDelete: (columnId: string) => void | Promise<void>;
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

const EditColumnModal: React.FC<EditColumnModalProps> = ({ column, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(column.title);
  const [keyword, setKeyword] = useState(column.keyword);
  const [selectedColor, setSelectedColor] = useState(column.color);
  const [isDoneColumn, setIsDoneColumn] = useState(column.isDoneColumn || false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(column.id);
      onClose();
    } catch (error) {
      console.error("Error borrando la columna", error);
      setIsDeleting(false);
    }
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
        className="relative overflow-hidden bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-lg w-full max-w-sm flex flex-col animate-scale-in"
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
          <div className="flex items-center justify-between gap-3 mt-6">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600/10 border border-red-500/40 rounded-md hover:bg-red-600/20 text-red-500 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Borrando...' : 'Borrar Columna'}
            </button>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 bg-white dark:bg-[#27272a] border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || isDeleting}
                className="px-4 py-2 bg-blue-600 border border-blue-500 rounded-md hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        {isDeleteConfirmOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
            <div className="w-full rounded-lg border border-red-500/30 bg-white p-5 shadow-2xl dark:bg-[#202023]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Borrar columna
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-neutral-600 dark:text-neutral-400">
                    Se eliminará <span className="font-semibold text-neutral-900 dark:text-neutral-100">"{column.title}"</span> junto con todas sus tarjetas. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md border border-neutral-300 bg-white text-sm text-neutral-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-[#27272a] dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md border border-red-500 bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? 'Borrando...' : 'Sí, borrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditColumnModal;
