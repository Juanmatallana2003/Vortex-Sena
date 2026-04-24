"use client";

import React, { useState, useRef } from 'react';
import KanbanColumn from './KanbanColumn';
import EditColumnModal from './EditColumnModal';
import CardDetailModal from './CardDetailModal';
import { Card, Column, WorkspaceMember } from '../types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface KanbanBoardProps {
  columns: Column[];
  workspaceMembers?: WorkspaceMember[];
  onOpenMembers?: () => void;
  onCardMove: (cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex?: number) => void;
  onColumnUpdate: (updatedColumn: Column) => void;
  onColumnDelete: (columnId: string) => Promise<void>;
  onCardUpdate: (updatedCard: Card) => void;
  onCardDelete: (cardId: string) => void;
  selectedCard: Card | null;
  onCardSelect: (card: Card | null) => void;
  onAddCard: (columnId: string, title: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  workspaceMembers = [],
  onOpenMembers,
  onCardMove,
  onColumnUpdate,
  onColumnDelete,
  onCardUpdate,
  onCardDelete,
  selectedCard,
  onCardSelect,
  onAddCard,
}) => {
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [activeCard, setActiveCard] = useState<{ cardId: string; sourceColumnId: string } | null>(null);
  const [activeDropColumnId, setActiveDropColumnId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  const findColumnIdByDroppable = (droppableId: string | number | null | undefined): string | null => {
    if (!droppableId) return null;
    const id = String(droppableId);

    if (id.startsWith('column:')) {
      return id.replace('column:', '');
    }

    if (!id.startsWith('card:')) {
      return null;
    }

    const cardId = id.replace('card:', '');
    for (const column of columns) {
      if (column.cards.some((card) => card.id === cardId)) {
        return column.id;
      }
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('textarea') ||
      target.closest('[draggable="true"]') ||
      target.closest('[data-dnd-card="true"]')
    ) {
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

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleSaveCard = (updatedCard: Card) => {
    onCardUpdate(updatedCard);
    onCardSelect(null);
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('¿Seguro que deseas eliminar la issue para siempre?')) {
      onCardDelete(cardId);
      onCardSelect(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current as { cardId?: string; columnId?: string } | undefined;
    if (!payload?.cardId || !payload.columnId) {
      setActiveCard(null);
      setActiveDropColumnId(null);
      return;
    }

    setActiveCard({
      cardId: payload.cardId,
      sourceColumnId: payload.columnId,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    setActiveDropColumnId(findColumnIdByDroppable(event.over?.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeCard || !event.over) {
      setActiveCard(null);
      setActiveDropColumnId(null);
      return;
    }

    const targetColumnId = findColumnIdByDroppable(event.over.id);
    if (!targetColumnId) {
      setActiveCard(null);
      setActiveDropColumnId(null);
      return;
    }

    const sourceColumn = columns.find((column) => column.id === activeCard.sourceColumnId);
    const targetColumn = columns.find((column) => column.id === targetColumnId);
    if (!sourceColumn || !targetColumn) {
      setActiveCard(null);
      setActiveDropColumnId(null);
      return;
    }

    const overId = String(event.over.id);
    let targetIndex = targetColumn.cards.length;

    if (overId.startsWith('card:')) {
      const overCardId = overId.replace('card:', '');
      const overIndex = targetColumn.cards.findIndex((card) => card.id === overCardId);
      if (overIndex >= 0) {
        const translatedTop = event.active.rect.current.translated?.top ?? event.active.rect.current.initial?.top ?? 0;
        const overMiddle = event.over.rect.top + event.over.rect.height / 2;
        const insertAfter = translatedTop > overMiddle;
        targetIndex = overIndex + (insertAfter ? 1 : 0);
      }
    }

    const sourceIndex = sourceColumn.cards.findIndex((card) => card.id === activeCard.cardId);
    if (sourceIndex === -1) {
      setActiveCard(null);
      setActiveDropColumnId(null);
      return;
    }

    if (activeCard.sourceColumnId === targetColumnId && targetIndex > sourceIndex) {
      targetIndex -= 1;
    }

    onCardMove(activeCard.cardId, activeCard.sourceColumnId, targetColumnId, targetIndex);

    setActiveCard(null);
    setActiveDropColumnId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveCard(null);
        setActiveDropColumnId(null);
      }}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#161618]">
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto overflow-y-hidden p-2 scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-default'}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex gap-1 h-full items-stretch">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                workspaceMembers={workspaceMembers}
                onCardSelect={onCardSelect}
                onEdit={setEditingColumn}
                onMoveCard={onCardMove}
                onAddCard={onAddCard}
                isDropTarget={activeDropColumnId === column.id}
              />
            ))}
          </div>
        </div>

        {editingColumn && (
          <EditColumnModal
            column={editingColumn}
            onClose={() => setEditingColumn(null)}
            onSave={onColumnUpdate}
            onDelete={onColumnDelete}
          />
        )}
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            workspaceMembers={workspaceMembers}
            onOpenMembers={onOpenMembers}
            onClose={() => onCardSelect(null)}
            onUpdate={handleSaveCard}
            onDelete={handleDeleteCard}
          />
        )}
        <style>{`.scrollbar-hide::-webkit-scrollbar {display: none;} .scrollbar-hide {-ms-overflow-style: none; scrollbar-width: none;}`}</style>
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
