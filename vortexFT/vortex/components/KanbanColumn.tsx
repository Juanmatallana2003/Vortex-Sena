"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Column, Card } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  onCardSelect: (card: Card) => void;
  onEdit: (column: Column) => void;
  onMoveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
  onAddCard: (columnId: string, title: string) => void; // El disparador de conexión a API nuevo!
}

const columnHighlightMap: { [key: string]: { ring: string, bg: string } } = {
  'bg-neutral-500': { ring: 'ring-neutral-500/50', bg: 'bg-neutral-500/5' },
  'bg-blue-400': { ring: 'ring-blue-400/50', bg: 'bg-blue-400/5' },
  'bg-yellow-400': { ring: 'ring-yellow-400/50', bg: 'bg-yellow-400/5' },
  'bg-purple-400': { ring: 'ring-purple-400/50', bg: 'bg-purple-400/5' },
  'bg-green-400': { ring: 'ring-green-400/50', bg: 'bg-green-400/5' },
  'bg-red-400': { ring: 'ring-red-400/50', bg: 'bg-red-400/5' },
  'bg-orange-400': { ring: 'ring-orange-400/50', bg: 'bg-orange-400/5' },
  'bg-pink-400': { ring: 'ring-pink-400/50', bg: 'bg-pink-400/5' },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onCardSelect, onEdit, onMoveCard, onAddCard }) => {
  const[isOver, setIsOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // Activará tu campo de texto visual
  const [newCardTitle, setNewCardTitle] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Da focus instantáneo si clickeaste el boton '+' 
  useEffect(() => {
    if (isAdding && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isAdding]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); setIsOver(true);
  };
  const handleDragLeave = () => { setIsOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    if (cardId && sourceColumnId) { onMoveCard(cardId, sourceColumnId, column.id); }
  };

  const handleAddSubmit = () => {
     if (newCardTitle.trim()) {
        onAddCard(column.id, newCardTitle.trim()); // Emite señal al padre (Tablero)
     }
     setIsAdding(false);
     setNewCardTitle("");
  };

  const highlightStyles = columnHighlightMap[column.color] || { ring: 'ring-neutral-700/50', bg: 'bg-neutral-800/30' };

  return (
    <div 
      className={`flex flex-col w-[316px] min-w-[316px] h-full rounded-xl transition-all duration-200 p-2 border border-transparent ${
        isOver ? `${highlightStyles.bg} ring-2 ${highlightStyles.ring} border-white/5 shadow-lg shadow-black/20` : 'bg-transparent'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-2 py-1 mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.color}`}></span>
          <div className="flex flex-col">
              <h2 className="font-medium text-neutral-900 dark:text-neutral-200 leading-tight">{column.title}</h2>
              {column.keyword && <span className="text-[10px] text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-mono leading-none mt-0.5">{column.keyword}</span>}
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-500 bg-gray-200 dark:bg-neutral-800/50 px-2 py-0.5 rounded-full ml-1">{column.cards.length}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-500">
          
          <button onClick={() => setIsAdding(true)} className="hover:text-neutral-900 dark:hover:text-neutral-200 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-800">
            <i className="fa-solid fa-plus text-xs"></i>
          </button>

          <button onClick={() => onEdit(column)} className="hover:text-neutral-900 dark:hover:text-neutral-200 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors" title="Edit Column">
            <i className="fa-solid fa-pencil text-xs"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-[10px] px-1">
        
        {isAdding && (
          <div className="bg-white dark:bg-[#202023] p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-md">
             <textarea
                ref={inputRef}
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddSubmit(); }
                   if (e.key === 'Escape') setIsAdding(false);
                }}
                placeholder="Titula esta issue/tarea (Enter = Guardar)"
                className="w-full text-sm bg-transparent focus:outline-none resize-none text-neutral-900 dark:text-neutral-200 mb-2 font-medium"
                rows={2}
             />
             <div className="flex gap-2 justify-end">
               <button onClick={() => setIsAdding(false)} className="text-[10px] font-semibold px-2 py-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">Cancelar</button>
               <button onClick={handleAddSubmit} className="text-[10px] bg-blue-600 font-bold hover:bg-blue-500 text-white px-3 py-1.5 rounded-md shadow-sm transition">Guardar y Enviar a Java</button>
             </div>
          </div>
        )}

        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} status={column.id} onCardSelect={onCardSelect} />
        ))}
        {isOver && column.cards.length === 0 && (
          <div className={`h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-neutral-600 transition-colors ${column.color.replace('bg-', 'border-').replace('-400', '-500/30')}`}>Drop here</div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </div>
  );
};

export default KanbanColumn;
