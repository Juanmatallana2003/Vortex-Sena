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
  badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, hasDropdown, isOpen, onClick, onContextMenu, onSettingsClick, level = 0, isActive, subText, isCollapsed, badgeCount }) => {
    const paddingClasses: { [key: number]: string } = {
        0: 'pl-1 pr-4',
        1: 'pl-6 pr-4',
        2: 'pl-10 pr-4',
    };
    const paddingClass = paddingClasses[level] || paddingClasses[0];
    const resolvedIcon = icon && icon.trim().length > 0 ? icon : 'fa-regular fa-folder';

    return (
        <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            if (onClick) onClick();
        }}
        onContextMenu={onContextMenu}
        className={`flex items-center py-2 text-neutral-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700/50 rounded-md ${paddingClass} ${isActive ? 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold border-l-[3px] border-l-[#3679da]' : 'border-l-[3px] border-l-transparent'} transition-colors duration-200 group h-9`}
        title={isCollapsed ? text : undefined}
        >
        <i className={`w-6 text-center text-neutral-500 dark:text-neutral-400 ${resolvedIcon} ${level === 2 ? 'text-[10px] text-purple-400' : 'text-base'} flex-shrink-0 transition-colors duration-200`}></i>
        
        <div className={`flex flex-col ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
            <span className={`truncate ${level === 2 ? 'text-xs font-semibold text-neutral-600 dark:text-[#aeb9cb] mb-[2px] ' : 'text-[13.5px]'}`}>{text}</span>
            {subText && <span className="text-[9px] font-mono uppercase font-semibold text-neutral-400 dark:text-neutral-600/70 truncate leading-none ">{subText}</span>}
        </div>
        
        <div className={`ml-auto flex items-center gap-1 transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0' : 'opacity-100'}`}>
            {typeof badgeCount === 'number' && badgeCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full border border-sky-500/45 bg-sky-500/15 px-1.5 text-[10px] font-bold text-sky-200">
                    {badgeCount > 99 ? '99+' : badgeCount}
                </span>
            )}
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
                    <i className="fa-solid fa-gear text-[10px]"></i>
                </div>
            )}
            {hasDropdown && (
                 <div className="flex items-center justify-center w-4 h-4">
                    <i className={`fa-solid fa-chevron-down text-[10px] text-neutral-400 dark:text-neutral-600/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
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
  currentUserLoggedHeaderStringName?: string;
  activeWorkspaceSelectionIDIdFromFrontToNav?: string; 
  onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI?: (clickedActiveSpecificTabFromListNav :string)=> void; 
  onMemberAdded?: (updatedSpace: Space) => void; // El puente de conexion corregido
  membersModalRequest?: { workspaceId: string; nonce: number } | null;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  isNotificationsOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  spaces, 
  invitedSpaces =[],
  favoriteSpaceIds, 
  onUpdateSpace, 
  onDeleteSpace, 
  onCreateSpace, 
  onToggleFavorite,
  isCollapsed = false,
  currentUserLoggedHeaderStringName="Not Linked Env", 
  activeWorkspaceSelectionIDIdFromFrontToNav,
  onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI,
  onMemberAdded,
  membersModalRequest,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  isNotificationsOpen = false
}) => {

  const[isProjectsOpen, setIsProjectsOpen] = useState(true);
  const[isInvitedOpen, setIsInvitedOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const[expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set( spaces.map(m=>m.id) )); 
  const[isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
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

  useEffect(() => { 
    if(spaces.length > 0 && expandedSpaces.size === 0) { 
        setExpandedSpaces(new Set( spaces.map(m=>m.id) )) 
    }
  }, [spaces]);

  const toggleSpace = (spaceId: string) => {
    if(onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI) {
        onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI(spaceId);
    }
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) { newExpanded.delete(spaceId); } else { newExpanded.add(spaceId); }
    setExpandedSpaces(newExpanded);
  };

  const handleContextToggleFavorite = (spaceId: string) => { onToggleFavorite(spaceId); closeContextMenu(); };
  const handleContextMenu = (event: React.MouseEvent, space: Space) => { event.preventDefault(); setContextMenu({ visible: true, x: event.clientX, y: event.clientY, space: space }); };
  const closeContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false, space: null }));
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) { setIsProfileMenuOpen(false); } }; if (isProfileMenuOpen) document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, [isProfileMenuOpen]);
  useEffect(() => { const handleGlobalClick = () => { if (contextMenu.visible) { closeContextMenu(); } }; if (contextMenu.visible) { document.addEventListener('click', handleGlobalClick); } return () => { document.removeEventListener('click', handleGlobalClick); }; },[contextMenu.visible]);
  useEffect(() => {
    if (!membersModalRequest?.workspaceId) return;
    const targetSpace = spaces.find(space => space.id === membersModalRequest.workspaceId);
    if (targetSpace) {
      setViewingMembersSpace(targetSpace);
    }
  }, [membersModalRequest?.workspaceId, membersModalRequest?.nonce, spaces]);

  const getRepoName = (url?: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  };

  const favoriteSpacesList = spaces.filter(s => favoriteSpaceIds.has(s.id));
  const uniformFavoriteIcon = "fa-regular fa-folder";

  return (
    <>
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} h-full flex-shrink-0 bg-gray-50 dark:bg-[#111113] p-2 flex flex-col border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 z-50 overflow-hidden`}>
        <div className="flex-1 overflow-y-auto scrollbar-hide mr-[-3px]">
          <nav className="flex flex-col gap-1 px-2 pt-2 pb-2 pr-[2px]">
            
            <NavItem
              icon="fa-regular fa-bell"
              text="Notifications"
              hasDropdown
              isOpen={isNotificationsOpen}
              badgeCount={unreadNotificationsCount}
              isCollapsed={isCollapsed}
              onClick={onOpenNotifications}
            />
            <NavItem icon="fa-brands fa-dropbox" text="Projects" hasDropdown isOpen={isProjectsOpen} onClick={() => setIsProjectsOpen(!isProjectsOpen)} isCollapsed={isCollapsed}  />
            
            {isProjectsOpen && (
              <div className="flex flex-col mb-2 mt-2 gap-1 animate-fade-in pb-3">

                
                {spaces.map(space => (
                   <div key={space.id} className="relative ">
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
                        isActive={ activeWorkspaceSelectionIDIdFromFrontToNav ? activeWorkspaceSelectionIDIdFromFrontToNav === space.id : false } 
                      />

                      {space.repoUrl && expandedSpaces.has(space.id) && !isCollapsed && (
                        <div className="relative overflow-visible">
                             <div className="absolute left-[34px] top-[-8px] bottom-1/2 w-px bg-neutral-300 dark:bg-[#434346]"></div>
                             <div className="absolute left-[34px] top-1/2 w-[22px] h-[0.7px] bg-neutral-300 dark:bg-neutral-600"></div>
                             
                              <div className='opacity-[0.98]' onClick={(exd) =>{ exd.preventDefault(); window.open(space.repoUrl, "_blank" ); } } > 
                                  <NavItem
                                      icon="fa-brands fa-github"
                                      text={getRepoName(space.repoUrl)}
                                      subText={space.defaultBranch ? `main/${space.defaultBranch}` : 'Root Git Code'}
                                      level={2}
                                  />
                              </div> 
                        </div>
                      )}
                   </div>
                ))}

              </div>
            )}

            <NavItem icon="fa-brands fa-buffer" text="Invited Spaces" hasDropdown isOpen={isInvitedOpen} onClick={() => setIsInvitedOpen(!isInvitedOpen)} isCollapsed={isCollapsed}/>
            {isInvitedOpen && (<div className="flex flex-col mb-2">{invitedSpaces.length > 0 ? ( invitedSpaces.map(space => (<NavItem key={space.id} icon={space.icon} text={space.name} level={isCollapsed ? 0 : 1} isCollapsed={isCollapsed} /> ))) : ( !isCollapsed && ( <div className="px-5 py-4 mt-2 mb-2 bg-[#0e0e10] border border-[#2a2a2e] rounded-xl text-[11px] opacity-[0.7] text-neutral-500"> Shared task Empty   <div className="mt-[2px] opacity-[0.4] text-center" >No requests</div> </div> )  )} </div>)}

            <NavItem icon="fa-regular fa-star" text="Favorites" hasDropdown isOpen={isFavoritesOpen} onClick={() => setIsFavoritesOpen(!isFavoritesOpen)} isCollapsed={isCollapsed} />
            {isFavoritesOpen && (<div className="flex flex-col mb-2 mt-1">{favoriteSpaceIds.size > 0 ? ( favoriteSpacesList.map(space => (<NavItem key={`fav-${space.id}`} icon={uniformFavoriteIcon} text={space.name} level={isCollapsed ? 0 : 1} isActive={activeWorkspaceSelectionIDIdFromFrontToNav ? activeWorkspaceSelectionIDIdFromFrontToNav === space.id : false} onClick={() => onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI && onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI(space.id)} onContextMenu={(e) => handleContextMenu(e, space)} onSettingsClick={(e) => handleContextMenu(e, space)} isCollapsed={isCollapsed} />)) ) : ( !isCollapsed && (<div className="px-5 py-3 text-[10px] text-center mt-2 border border-[#333]/30 bg-[#0e0e11] text-neutral-600/70 italic"> No invited spaces </div>))}</div> )}
          </nav>
        </div>

        <div className="p-2 mt-auto border-t border-neutral-200 dark:border-neutral-800/50">
          
           <button onClick={() => setIsCreateSpaceModalOpen(true)} className="w-full flex items-center justify-center py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300" title={isCollapsed ? "Create space" : undefined} >
            <i className="fa-solid fa-plus text-xs flex-shrink-0"></i>
            <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out flex items-center ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-2'}`}>
              <span>Create space</span>
            </div>
          </button>

        </div>

      </aside>

      {isCreateSpaceModalOpen && <CreateSpaceModal onClose={() => setIsCreateSpaceModalOpen(false)} onCreate={onCreateSpace} />}
      {editingSpace && <EditSpaceModal space={editingSpace} onClose={() => setEditingSpace(null)} onSave={onUpdateSpace} />}
      
      {/* 🔴 Aquí agregamos la conexión segura para que actualice los miembros 🔴 */}
      {viewingMembersSpace && (
         <MembersModal 
             space={viewingMembersSpace} 
             onClose={() => setViewingMembersSpace(null)} 
             onMemberAdded={(updatedSpace) => {
                 setViewingMembersSpace(updatedSpace);
                 (onMemberAdded || onUpdateSpace)(updatedSpace);
             }} // Si no pasan la funcion, usamos updateSpace como respaldo
         />
      )}
      
      {contextMenu.visible && contextMenu.space && (<SpaceContextMenu x={contextMenu.x} y={contextMenu.y} space={contextMenu.space} isFavorite={favoriteSpaceIds.has(contextMenu.space.id)} onClose={closeContextMenu} onEdit={() => { setEditingSpace(contextMenu.space); closeContextMenu(); }} onViewMembers={() => { setViewingMembersSpace(contextMenu.space); closeContextMenu(); }} onToggleFavorite={() => handleContextToggleFavorite(contextMenu.space!.id)} onDelete={() => { onDeleteSpace(contextMenu.space!.id); closeContextMenu(); }}/> )}
    </>
  );
};
export default Sidebar;
