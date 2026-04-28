
import React from 'react';
import { Space } from '../types';

interface SpacesMobileOverlayProps {
  spaces: Space[];
  onClose: () => void;
  onSelectSpace: (space: Space) => void;
}

const SpacesMobileOverlay: React.FC<SpacesMobileOverlayProps> = ({ spaces, onClose, onSelectSpace }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#111113] animate-fade-in flex flex-col md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50">
        <h2 className="text-lg font-semibold text-neutral-100">All Spaces</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800/50 text-neutral-400"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      {/* Grid de Espacios */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="grid grid-cols-2 gap-4">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => onSelectSpace(space)}
              className="flex flex-col items-center gap-4 p-5 bg-[#161618] border border-neutral-800 rounded-2xl hover:border-blue-500/50 transition-all active:scale-95 group shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-neutral-800/50 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                <i className={`${space.icon} text-2xl`}></i>
              </div>
              <span className="text-sm font-medium text-neutral-200 group-hover:text-blue-100 truncate w-full text-center">
                {space.name}
              </span>
            </button>
          ))}

          {/* Botón rápido para crear */}
          <button
            className="flex flex-col items-center gap-4 p-5 border-2 border-dashed border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all active:scale-95 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-neutral-800/20 flex items-center justify-center text-neutral-600 group-hover:text-neutral-400">
              <i className="fa-solid fa-plus text-2xl"></i>
            </div>
            <span className="text-sm font-medium text-neutral-500 group-hover:text-neutral-400">
              New Space
            </span>
          </button>
        </div>

        {/* Info extra */}
        <div className="mt-12 text-center">
          <p className="text-xs text-neutral-600 uppercase tracking-widest font-bold mb-2">Workspace context</p>
          <p className="text-sm text-neutral-400 px-8 leading-relaxed">
            Select a space to view its issues and activity. Spaces are linked to GitHub repositories.
          </p>
        </div>
      </div>

      {/* Footer / Back Button */}
      <div className="p-6 border-t border-neutral-800/50 text-center">
        <button 
          onClick={onClose}
          className="text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-neutral-300 transition-colors"
        >
          Tap outside or press back to return
        </button>
      </div>
    </div>
  );
};

export default SpacesMobileOverlay;
