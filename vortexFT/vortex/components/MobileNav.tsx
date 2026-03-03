
import React from 'react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="md:hidden flex items-center bg-[#111113] border-t border-neutral-800/50 safe-area-bottom w-full py-2">
      
      {/* Grupo Principal: 3 Iconos ocupando el espacio disponible, centrados y con mayor separación (gap-10) */}
      <div className="flex-1 flex items-center justify-center gap-10 px-2">
        {/* Notifications */}
        <button 
          onClick={() => onTabChange('notifications')}
          className={`relative w-12 h-12 flex flex-col items-center justify-center transition-colors ${activeTab === 'notifications' ? 'text-blue-400' : 'text-neutral-500'}`}
        >
          <i className="fa-regular fa-bell text-xl"></i>
          {activeTab === 'notifications' && (
            <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full"></div>
          )}
        </button>

        {/* Favorites */}
        <button 
          onClick={() => onTabChange('favorites')}
          className={`relative w-12 h-12 flex flex-col items-center justify-center transition-colors ${activeTab === 'favorites' ? 'text-blue-400' : 'text-neutral-500'}`}
        >
          <i className="fa-regular fa-star text-xl"></i>
          {activeTab === 'favorites' && (
            <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full"></div>
          )}
        </button>

        {/* Kanban Board (Main View) */}
        <button 
          onClick={() => onTabChange('board')}
          className={`relative w-12 h-12 flex flex-col items-center justify-center transition-all ${
            activeTab === 'board' 
              ? 'text-blue-400' 
              : 'text-neutral-500'
          }`}
        >
          <i className="fa-solid fa-table-columns text-xl"></i>
          {activeTab === 'board' && (
            <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Separador Vertical (Más visible) */}
      <div className="w-px h-8 bg-neutral-600/50"></div>

      {/* Botón de Espacios (Compacto a la derecha) */}
      <div className="px-3 flex items-center justify-center">
        <button 
            onClick={() => onTabChange('spaces')}
            className={`relative w-12 h-12 flex flex-col items-center justify-center transition-colors ${activeTab === 'spaces' ? 'text-blue-400' : 'text-neutral-500'}`}
        >
            <i className="fa-solid fa-layer-group text-xl"></i>
            {activeTab === 'spaces' && (
            <div className="absolute bottom-2 w-1 h-1 bg-blue-500 rounded-full"></div>
            )}
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
