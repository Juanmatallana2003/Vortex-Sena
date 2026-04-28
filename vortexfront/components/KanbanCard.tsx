"use client";


import React, { useState } from 'react';
import { Card } from '../types';
import Avatar from './Avatar';
import TagPill from './TagPill';

interface KanbanCardProps {
  card: Card;
  status: string;
  onCardSelect: (card: Card) => void;
}

const statusHoverBorderConfig: { [key: string]: string } = {
    'To Do': 'hover:border-neutral-500',
    'In Progress': 'hover:border-blue-400',
    'In Review': 'hover:border-yellow-400',
    'Done': 'hover:border-purple-400',
};


const KanbanCard: React.FC<KanbanCardProps> = ({ card, status, onCardSelect }) => {
    const [isDragging, setIsDragging] = useState(false);

    // Fallback for dynamic columns if specific color isn't mapped
    const hoverBorderClass = statusHoverBorderConfig[status] || 'hover:border-neutral-500';

    const handleDragStart = (e: React.DragEvent) => {
      setIsDragging(true);
      e.dataTransfer.setData('cardId', card.id);
      e.dataTransfer.setData('sourceColumnId', status);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

  return (
    <div 
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onCardSelect(card)}
        className={`bg-white dark:bg-[#28282b] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 ${hoverBorderClass} cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-500 font-mono">#{card.number}</span>
        </div>
        {card.assignees && (
          <div className="flex -space-x-2">
            {card.assignees.map((assignee, index) => (
              <Avatar key={index} src={assignee} alt={`Assignee ${index + 1}`} />
            ))}
          </div>
        )}
      </div>
      <p className="text-neutral-900 dark:text-neutral-200 mb-3 select-none">{card.title}</p>
      <div className="flex flex-wrap items-center gap-2 select-none">
        {card.tags.map((tag, index) => (
          <TagPill key={index} tag={tag} />
        ))}
        {card.dueDate && (
          <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-100 dark:bg-neutral-700/60 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
            <i className="fa-regular fa-calendar text-neutral-500 dark:text-neutral-400"></i>
            <span>{card.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;

