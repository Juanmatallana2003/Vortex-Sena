"use client";


import React, { useState } from 'react';
import { Column, Card } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  onCardSelect: (card: Card) => void;
  onEdit: (column: Column) => void;
  onMoveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
}

// Mapa para convertir la clase de fondo en clases de anillo y fondo sutil para el drag & drop
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

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onCardSelect, onEdit, onMoveCard }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    if (cardId && sourceColumnId) {
      onMoveCard(cardId, sourceColumnId, column.id);
    }
  };

  // Obtener los estilos de resaltado basados en el color de la columna
  const highlightStyles = columnHighlightMap[column.color] || { ring: 'ring-neutral-700/50', bg: 'bg-neutral-800/30' };

  return (
    <div 
      className={`flex flex-col w-[316px] min-w-[316px] h-full rounded-xl transition-all duration-200 p-2 border border-transparent ${
        isOver 
          ? `${highlightStyles.bg} ring-2 ${highlightStyles.ring} border-white/5 shadow-lg shadow-black/20` 
          : 'bg-transparent'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header fijo de la columna */}
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
          <button className="hover:text-neutral-900 dark:hover:text-neutral-200 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-800">
            <i className="fa-solid fa-plus text-xs"></i>
          </button>
          <button 
            onClick={() => onEdit(column)}
            className="hover:text-neutral-900 dark:hover:text-neutral-200 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
            title="Edit Column"
          >
            <i className="fa-solid fa-pencil text-xs"></i>
          </button>
        </div>
      </div>

      {/* Contenedor de tarjetas con scroll independiente */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-[10px] px-1">
        {column.cards.map((card) => (
          <KanbanCard 
            key={card.id} 
            card={card} 
            status={column.id} 
            onCardSelect={onCardSelect} 
          />
        ))}
        {/* Placeholder para cuando la columna está vacía y se arrastra una tarjeta */}
        {isOver && column.cards.length === 0 && (
          <div className={`h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-neutral-600 transition-colors ${column.color.replace('bg-', 'border-').replace('-400', '-500/30')}`}>
            Drop here
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
};

export default KanbanColumn;

