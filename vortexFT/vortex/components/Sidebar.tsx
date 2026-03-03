"use client";


import React, { useState, useEffect, useRef } from 'react';
import CreateSpaceModal from './CreateSpaceModal';
import EditSpaceModal from './EditSpaceModal';
import MembersModal from './MembersModal';
import SpaceContextMenu from './SpaceContextMenu';
import { Space } from '../types';

interface NavItemProps {
  icon: string;
  text: string;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  onSettingsClick?: (event: React.MouseEvent) => void;
  level?: number;
  isActive?: boolean;
  subText?: string;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, hasDropdown, isOpen, onClick, onContextMenu, onSettingsClick, level = 0, isActive, subText, isCollapsed }) => {
    const paddingClasses: { [key: number]: string } = {
        0: 'pl-1 pr-4',
        1: 'pl-6 pr-4',
        2: 'pl-10 pr-4',
    };
    const paddingClass = paddingClasses[level] || paddingClasses[0];

    return (
        <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
        }}
        onContextMenu={onContextMenu}
        className={`flex items-center py-2 text-neutral-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700/50 rounded-md ${paddingClass} ${isActive ? 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : ''} transition-colors duration-200 group h-9`}
        title={isCollapsed ? text : undefined}
        >
        <i className={`w-6 text-center text-neutral-500 dark:text-neutral-400 ${icon} ${level === 2 ? 'text-xs' : 'text-base'} flex-shrink-0 transition-colors duration-200`}></i>
        
        <div className={`flex flex-col ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
            <span className={`truncate ${level === 2 ? 'text-sm text-neutral-500 dark:text-neutral-400' : ''}`}>{text}</span>
            {subText && <span className="text-[10px] text-neutral-400 dark:text-neutral-600 truncate leading-none mt-0.5">{subText}</span>}
        </div>
        
        <div className={`ml-auto flex items-center gap-1 transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'opacity-100'}`}>
            {onSettingsClick && (
                <div 
                    role="button"
                    className="hidden group-hover:flex items-center justify-center w-6 h-6 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 text-neutral-500 dark:text-neutral-400 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSettingsClick(e);
                    }}
                >
                    <i className="fa-solid fa-gear text-xs"></i>
                </div>
            )}
            {hasDropdown && (
                 <div className="flex items-center justify-center w-4 h-4">
                    <i className={`fa-solid fa-chevron-down text-xs text-neutral-500 dark:text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                 </div>
            )}
        </div>
        </a>
    );
};

interface SidebarProps {
  spaces: Space[];
  invitedSpaces?: Space[];
  favoriteSpaceIds: Set<string>;
  onUpdateSpace: (space: Space) => void;
  onDeleteSpace: (id: string) => void;
  onCreateSpace: (name: string, url: string, branch: string) => void;
  onToggleFavorite: (id: string) => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  spaces, 
  invitedSpaces = [],
  favoriteSpaceIds, 
  onUpdateSpace, 
  onDeleteSpace, 
  onCreateSpace, 
  onToggleFavorite,
  isCollapsed = false
}) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isInvitedOpen, setIsInvitedOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [viewingMembersSpace, setViewingMembersSpace] = useState<Space | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    space: Space | null;
  }>({ visible: false, x: 0, y: 0, space: null });

  const toggleSpace = (spaceId: string) => {
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId);
    } else {
      newExpanded.add(spaceId);
    }
    setExpandedSpaces(newExpanded);
  };

  const handleContextToggleFavorite = (spaceId: string) => {
      onToggleFavorite(spaceId);
      closeContextMenu();
  };

  const handleContextMenu = (event: React.MouseEvent, space: Space) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, space: space });
  };

  const closeContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false, space: null }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };
    if (isProfileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleGlobalClick);
    }
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [contextMenu.visible]);

  const getRepoName = (url?: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  };

  const favoriteSpacesList = spaces.filter(s => favoriteSpaceIds.has(s.id));

  return (
    <>
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} h-full flex-shrink-0 bg-gray-50 dark:bg-[#111113] p-2 flex flex-col border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300`}>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <nav className="flex flex-col gap-1 px-2 pt-2 pb-2">
            
            {/* Notifications Section (Moved to Top) */}
            <NavItem icon="fa-regular fa-bell" text="Notifications" isCollapsed={isCollapsed} />

            {/* Projects Section (Main) */}
            <NavItem
              icon="fa-brands fa-dropbox"
              text="Projects"
              hasDropdown
              isOpen={isProjectsOpen}
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              isCollapsed={isCollapsed}
              isActive={true} // Highlighted as in the image
            />
            {isProjectsOpen && (
              <div className="flex flex-col mb-2">
                {!isCollapsed && <div className="px-4 pt-2 pb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">Seiroo</div>}
                {spaces.map(space => (
                   <div key={space.id} className="relative">
                      <NavItem
                        icon={expandedSpaces.has(space.id) ? "fa-regular fa-folder-open" : "fa-regular fa-folder"}
                        text={space.name}
                        level={isCollapsed ? 0 : 1}
                        hasDropdown={!!space.repoUrl}
                        isOpen={expandedSpaces.has(space.id)}
                        onClick={() => toggleSpace(space.id)}
                        onContextMenu={(e) => handleContextMenu(e, space)}
                        onSettingsClick={(e) => handleContextMenu(e, space)}
                        isCollapsed={isCollapsed}
                      />
                      {space.repoUrl && expandedSpaces.has(space.id) && !isCollapsed && (
                        <div className="relative">
                             <div className="absolute left-[2.8rem] top-0 bottom-1/2 w-px bg-neutral-300 dark:bg-neutral-800"></div>
                             <div className="absolute left-[2.8rem] top-1/2 w-3 h-px bg-neutral-300 dark:bg-neutral-800"></div>
                             <NavItem
                                icon="fa-brands fa-github"
                                text={getRepoName(space.repoUrl)}
                                subText={space.defaultBranch ? `on ${space.defaultBranch}` : undefined}
                                level={2}
                            />
                        </div>
                      )}
                   </div>
                ))}
              </div>
            )}

            {/* Invited Spaces Section */}
             <NavItem
              icon="fa-brands fa-buffer"
              text="Invited Spaces"
              hasDropdown
              isOpen={isInvitedOpen}
              onClick={() => setIsInvitedOpen(!isInvitedOpen)}
              isCollapsed={isCollapsed}
            />
            {isInvitedOpen && (
                <div className="flex flex-col mb-2">
                    {invitedSpaces.length > 0 ? (
                        invitedSpaces.map(space => (
                            <NavItem
                                key={space.id}
                                icon={space.icon}
                                text={space.name}
                                level={isCollapsed ? 0 : 1}
                                isCollapsed={isCollapsed}
                            />
                        ))
                    ) : (
                        !isCollapsed && (
                            <div className="px-4 py-2 text-[10px] text-neutral-500 dark:text-neutral-600 italic">
                                No invited spaces
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Favorites Section */}
            <NavItem
              icon="fa-regular fa-star"
              text="Favorites"
              hasDropdown
              isOpen={isFavoritesOpen}
              onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
              isCollapsed={isCollapsed}
            />
            {isFavoritesOpen && (
                <div className="flex flex-col mb-2">
                    {favoriteSpaceIds.size > 0 ? (
                        favoriteSpacesList.map(space => (
                            <NavItem
                                key={`fav-${space.id}`}
                                icon={space.icon}
                                text={space.name}
                                level={isCollapsed ? 0 : 1}
                                onContextMenu={(e) => handleContextMenu(e, space)}
                                onSettingsClick={(e) => handleContextMenu(e, space)}
                                isCollapsed={isCollapsed}
                            />
                        ))
                    ) : (
                        !isCollapsed && (
                            <div className="px-4 py-2 text-[10px] text-neutral-500 dark:text-neutral-600 italic">
                                Right click a space to add to favorites
                            </div>
                        )
                    )}
                </div>
            )}

          </nav>
        </div>

        <div className="p-2 mt-auto border-t border-neutral-200 dark:border-neutral-800/50">
          <button
            onClick={() => setIsCreateSpaceModalOpen(true)}
            className="w-full flex items-center justify-center py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300"
            title={isCollapsed ? "Create space" : undefined}
          >
            <i className="fa-solid fa-plus text-xs flex-shrink-0"></i>
            <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out flex items-center ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-2'}`}>
              <span>Create space</span>
            </div>
          </button>
        </div>
      </aside>

      {isCreateSpaceModalOpen && <CreateSpaceModal onClose={() => setIsCreateSpaceModalOpen(false)} onCreate={onCreateSpace} />}
      {editingSpace && <EditSpaceModal space={editingSpace} onClose={() => setEditingSpace(null)} onSave={onUpdateSpace} />}
      {viewingMembersSpace && <MembersModal space={viewingMembersSpace} onClose={() => setViewingMembersSpace(null)} />}
      
      {contextMenu.visible && contextMenu.space && (
        <SpaceContextMenu
          x={contextMenu.x} y={contextMenu.y} space={contextMenu.space}
          isFavorite={favoriteSpaceIds.has(contextMenu.space.id)}
          onClose={closeContextMenu}
          onEdit={() => { setEditingSpace(contextMenu.space); closeContextMenu(); }}
          onViewMembers={() => { setViewingMembersSpace(contextMenu.space); closeContextMenu(); }}
          onToggleFavorite={() => handleContextToggleFavorite(contextMenu.space!.id)}
          onDelete={() => { onDeleteSpace(contextMenu.space!.id); closeContextMenu(); }}
        />
      )}
    </>
  );
};

export default Sidebar;

