
import React from 'react';
import { Space } from '../types';

interface FavoritesMobileOverlayProps {
  spaces: Space[];
  favoriteSpaceIds: Set<string>;
  onClose: () => void;
  onSelectSpace: (space: Space) => void;
  onRemoveFavorite: (id: string) => void;
}

const FavoritesMobileOverlay: React.FC<FavoritesMobileOverlayProps> = ({ 
    spaces, 
    favoriteSpaceIds, 
    onClose, 
    onSelectSpace, 
    onRemoveFavorite 
}) => {
  
  const favoriteSpaces = spaces.filter(s => favoriteSpaceIds.has(s.id));
  const uniformFavoriteIcon = "fa-regular fa-folder";

  return (
    <div className="fixed inset-0 z-[100] bg-[#111113] animate-fade-in flex flex-col md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/50">
        <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <i className="fa-solid fa-star text-yellow-500 text-sm"></i>
            Favorites
        </h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800/50 text-neutral-400"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>
      </div>

      {/* Grid de Favoritos */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {favoriteSpaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
            {favoriteSpaces.map((space) => (
                <div
                    key={space.id}
                    className="flex items-center gap-4 p-4 bg-[#161618] border border-neutral-800 rounded-xl active:scale-[0.98] transition-all shadow-lg group relative"
                >
                    {/* Icon Area */}
                    <button 
                        onClick={() => onSelectSpace(space)}
                        className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0 border border-yellow-500/20"
                    >
                        <i className={`${uniformFavoriteIcon} text-xl`}></i>
                    </button>
                    
                    {/* Text Area */}
                    <button 
                        onClick={() => onSelectSpace(space)}
                        className="flex flex-col flex-1 text-left min-w-0"
                    >
                        <span className="text-base font-medium text-neutral-200 truncate">
                            {space.name}
                        </span>
                        {space.repoUrl && (
                            <span className="text-xs text-neutral-500 flex items-center gap-1.5 truncate mt-0.5">
                                <i className="fa-brands fa-github"></i>
                                {space.repoUrl.split('/').pop()}
                            </span>
                        )}
                    </button>

                    {/* Unfavorite Button */}
                    <button 
                        onClick={() => onRemoveFavorite(space.id)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-red-400 transition-colors z-10"
                    >
                        <i className="fa-solid fa-star text-yellow-600/50 hover:text-neutral-500"></i>
                    </button>
                </div>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
                    <i className="fa-regular fa-star text-3xl text-neutral-600"></i>
                </div>
                <h3 className="text-lg font-medium text-neutral-300 mb-2">No favorites yet</h3>
                <p className="text-sm text-neutral-500">
                    Mark spaces as favorites in the &quot;My Work&quot; tab to see them here for quick access.
                </p>
                <button 
                    onClick={() => { onClose(); /* Logic to go to spaces could be added here */ }}
                    className="mt-6 px-6 py-2 bg-[#27272a] border border-neutral-700 rounded-lg text-sm text-neutral-200"
                >
                    Browse Spaces
                </button>
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-800/50 text-center">
        <button 
          onClick={onClose}
          className="text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-neutral-300 transition-colors"
        >
          Return to Board
        </button>
      </div>
    </div>
  );
};

export default FavoritesMobileOverlay;

