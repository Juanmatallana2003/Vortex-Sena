import React from 'react';
import { Space } from '../types';

interface SpaceContextMenuProps {
  x: number;
  y: number;
  space: Space;
  isFavorite: boolean;
  onClose: () => void;
  onEdit: () => void;
  onViewMembers: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const ContextMenuItem: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
  badge?: string | number;
}> = ({ icon, label, onClick, className = '', badge }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-sm text-neutral-200 hover:bg-neutral-700/70 rounded-[4px] ${className}`}
    >
      <div className="flex items-center gap-3">
        <i className={`w-4 text-center ${icon} text-neutral-400`}></i>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="text-xs text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded ml-2 min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
};

const SpaceContextMenu: React.FC<SpaceContextMenuProps> = ({ x, y, space, isFavorite, onClose, onEdit, onViewMembers, onToggleFavorite, onDelete }) => {
  
  // 🔥 AQUÍ LA LECTURA REAL DE LA BASE DE DATOS 🔥
  // Si el espacio tiene miembros cargados desde el backend, cuenta cuántos son. 
  // Si no hay o viene nulo, pon un 0, en lugar de un 4 falso.
  const realMemberCount = space.members ? space.members.length : 0;

  return (
    <div
      style={{ top: y, left: x }}
      className="fixed bg-white dark:bg-[#212124] border border-neutral-200 dark:border-neutral-700 rounded-md shadow-2xl p-1.5 z-[100] w-60 animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 mb-1">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Space</p>
        <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{space.name}</p>
      </div>
      <div className="h-px bg-neutral-200 dark:bg-neutral-700/80 my-1"></div>
      
      {/* Edit & View Group */}
      <ContextMenuItem icon="fa-solid fa-pencil" label="Edit space..." onClick={onEdit} />
      <ContextMenuItem 
        icon="fa-solid fa-users" 
        label="View members" 
        onClick={onViewMembers} 
        badge={realMemberCount} // <--- Pasamos la cuenta real aquí
      />
      
      <div className="h-px bg-neutral-200 dark:bg-neutral-700/80 my-1"></div>

      {/* Favorites (Penultimate) */}
      <ContextMenuItem 
        icon={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`} 
        label={isFavorite ? "Remove from favorites" : "Add to favorites"} 
        onClick={onToggleFavorite}
        className={isFavorite ? "text-yellow-500 dark:text-yellow-400/90 hover:text-yellow-600 dark:hover:text-yellow-300" : ""}
      />
      
      <div className="h-px bg-neutral-200 dark:bg-neutral-700/80 my-1"></div>

      {/* Delete (Last) */}
      <ContextMenuItem icon="fa-solid fa-trash-can" label="Delete space" onClick={onDelete} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-300" />
    </div>
  );
};

export default SpaceContextMenu;
