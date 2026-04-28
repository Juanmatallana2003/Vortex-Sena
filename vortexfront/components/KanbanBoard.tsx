"use client";

import React, { useState, useRef } from 'react';
import KanbanColumn from './KanbanColumn';
import EditColumnModal from './EditColumnModal';
import CardDetailModal from './CardDetailModal';
import { Card, Column } from '../types';

interface KanbanBoardProps {
  columns: Column[];
  onCardMove: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
  onColumnUpdate: (updatedColumn: Column) => void;
  onCardUpdate: (updatedCard: Card) => void;
  onCardDelete: (cardId: string) => void;
  selectedCard: Card | null;
  onCardSelect: (card: Card | null) => void;
  onAddCard: (columnId: string, title: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
    columns,
    onCardMove,
    onColumnUpdate,
    onCardUpdate,
    onCardDelete,
    selectedCard,
    onCardSelect,
    onAddCard
}) => {
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const[isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('textarea') || target.closest('[draggable="true"]')) {
      return;
    }
    const customScrollbar = target.closest('.custom-scrollbar');
    if (customScrollbar) {
      const rect = customScrollbar.getBoundingClientRect();
      if (e.clientX > rect.right - 15) return;
    }
    
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => { setIsDragging(false); };
  const handleMouseUp = () => { setIsDragging(false); };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleSaveCard = (updatedCard: Card) => { onCardUpdate(updatedCard); onCardSelect(null); };
  const handleDeleteCard = (cardId: string) => {
      if (window.confirm("¿Seguro que deseas eliminar la issue para siempre?")) {
          onCardDelete(cardId);
          onCardSelect(null);
      }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#161618]">
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-x-auto overflow-y-hidden p-2 scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-default'}`}
        onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
      >
        <div className="flex gap-1 h-full items-start">
          {columns.map((column) => (
            <KanbanColumn 
                key={column.id} 
                column={column} 
                onCardSelect={onCardSelect} 
                onEdit={setEditingColumn}
                onMoveCard={onCardMove}
                onAddCard={onAddCard} 
            />
          ))}
        </div>
      </div>
      
      {editingColumn && <EditColumnModal column={editingColumn} onClose={() => setEditingColumn(null)} onSave={onColumnUpdate} />}
      {selectedCard && <CardDetailModal card={selectedCard} onClose={() => onCardSelect(null)} onUpdate={handleSaveCard} onDelete={handleDeleteCard} />}
      <style>{`.scrollbar-hide::-webkit-scrollbar {display: none;} .scrollbar-hide {-ms-overflow-style: none; scrollbar-width: none;}`}</style>
    </div>
  );
};

export default KanbanBoard;