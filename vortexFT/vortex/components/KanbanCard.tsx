"use client";


import React, { useState } from 'react';
import { Card, WorkspaceMember } from '../types';
import Avatar from './Avatar';
import TagPill from './TagPill';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  card: Card;
  columnId: string;
  workspaceMembers?: WorkspaceMember[];
  onCardSelect: (card: Card) => void;
}

const statusHoverBorderConfig: { [key: string]: string } = {
    'To Do': 'hover:border-neutral-500',
    'In Progress': 'hover:border-blue-400',
    'In Review': 'hover:border-yellow-400',
    'Done': 'hover:border-purple-400',
};


const KanbanCard: React.FC<KanbanCardProps> = ({ card, columnId, workspaceMembers = [], onCardSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: sortableDragging } = useSortable({
      id: `card:${card.id}`,
      data: {
        type: 'card',
        cardId: card.id,
        columnId
      }
    });

    const findMemberById = (memberId: string) => workspaceMembers.find(m => m.id === memberId);
    const assigneeVisuals = (card.assignees || []).map((assigneeId, index) => {
      const member = findMemberById(assigneeId);
      const fallbackIsUrl = assigneeId.startsWith('http://') || assigneeId.startsWith('https://');
      return {
        key: `${assigneeId}-${index}`,
        src: member?.avatarUrl || (fallbackIsUrl ? assigneeId : "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"),
        alt: member?.name || `Assignee ${index + 1}`
      };
    });

    // Fallback for dynamic columns if specific color isn't mapped
    const hoverBorderClass = statusHoverBorderConfig[columnId] || 'hover:border-neutral-500';
    const dragActive = isDragging || sortableDragging;
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: sortableDragging ? 60 : undefined
    } as React.CSSProperties;

  return (
    <div 
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        data-dnd-card="true"
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerCancel={() => setIsDragging(false)}
        onClick={() => onCardSelect(card)}
        className={`bg-white dark:bg-[#28282b] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 ${hoverBorderClass} cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm ${dragActive ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 dark:text-neutral-500 font-mono">#{card.number}</span>
        </div>
        {assigneeVisuals.length > 0 && (
          <div className="flex -space-x-2">
            {assigneeVisuals.map((assignee) => (
              <Avatar key={assignee.key} src={assignee.src} alt={assignee.alt} />
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

