"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import {Card, ChangeLogEntry, Column, FilterState, Space, Tag} from "@/types";
import {KANBAN_COLUMNS} from "@/constants";
import FilterMenu from "@/components/FilterMenu";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import MobileNav from "@/components/MobileNav";
import SpacesMobileOverlay from "@/components/SpacesMobileOverlay";
import NotificationsMobileOverlay from "@/components/NotificationsMobileOverlay";
import FavoritesMobileOverlay from "@/components/FavoritesMobileOverlay";
import HistoryModal from "@/components/HistoryModal";
import CreateColumnModal from "@/components/CreateColumnModal";

import { vortexApi } from "@/api";

const INITIAL_HISTORY_LOG: ChangeLogEntry[] =[
  {
    id: '1', type: 'manual', description: 'Updated landing page requirements',
    user: { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/40?u=a' },
    timestamp: new Date().toISOString(), details: '...', cardId: 'card-1'
  },
];

interface ProfileMenuProps {

  onClose: () => void;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onSignOut, theme, onToggleTheme, triggerRef }) => {

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [onClose, triggerRef]);

  return (
    <div ref={menuRef} className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 animate-scale-in overflow-hidden origin-top-right">
      <div className="p-1 space-y-1">
        <button onClick={onToggleTheme} className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors">
          <div className="flex items-center gap-2"><i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i><span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span></div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-neutral-400'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} style={{ left: theme === 'dark' ? '18px' : '2px' }}></div>
          </div>
        </button>
        <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1"></div>
        <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-md transition-colors text-left"><i className="fa-solid fa-arrow-right-from-bracket"></i><span>Cerrar sesión</span></button>
      </div>
    </div>
  );
};

const App: React.FC = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const[isSpacesMobileOpen, setIsSpacesMobileOpen] = useState(false);
  const [isNotificationsMobileOpen, setIsNotificationsMobileOpen] = useState(false);
  const [isFavoritesMobileOpen, setIsFavoritesMobileOpen] = useState(false);
  
  const [columns, setColumns] = useState<Column[]>([]); 
  const [filters, setFilters] = useState<FilterState>({ tags: [], statuses:[], assignees: [], });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const[isHistoryOpen, setIsHistoryOpen] = useState(false);
  const[isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [history, setHistory] = useState<ChangeLogEntry[]>(INITIAL_HISTORY_LOG);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const [spaces, setSpaces] = useState<Space[]>([]);
  const invitedSpaces: Space[] =[ { id: 'space-invited-1', name: 'Acme Corp', icon: 'fa-regular fa-building', repoUrl: '', defaultBranch: '' }];
  const [favoriteSpaceIds, setFavoriteSpaceIds] = useState<Set<string>>(new Set());


  useEffect(() => {

    const fetchVortexData = async () => {

      try {

        const data = await vortexApi.getWorkspaces(); 
        
        if (data && data.length > 0) {

          setSpaces(data); 

          const mainWorkspace = data[0]; 
          
          if (mainWorkspace.columns) {

            const formattedColumns = mainWorkspace.columns.map((col: any) => ({
              ...col,
              cards: col.cards ? col.cards.map((card: any) => ({
                ...card,
                number: card.issueNumber, 
                tags: [] 
              })) :[]
            }));

            setColumns(formattedColumns); 
          }
        } else {

            setColumns(KANBAN_COLUMNS); 
        }
      } catch (error) {
        console.error("No se pudo contactar al servidor Vortex", error);
        setColumns(KANBAN_COLUMNS); 
      }
    };

    fetchVortexData();
  },[]);

  useEffect(() => {

    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleCreateSpace = async (spaceName: string, repoUrl: string, defaultBranch: string) => {

      try {

        const newSpaceDB = await vortexApi.createWorkspace(spaceName, repoUrl, defaultBranch);

        const newSpace: Space = { ...newSpaceDB, icon: 'fa-regular fa-folder', columns:[] };

        setSpaces([...spaces, newSpace]);
      } catch (error) {
        console.error("Fallo al crear espacio real", error);
      }
  };

  const handleUpdateSpace = (updatedSpace: Space) => setSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
  const handleDeleteSpace = (spaceId: string) => {

    setSpaces(spaces.filter(s => s.id !== spaceId));
    if (favoriteSpaceIds.has(spaceId)) { const newFavs = new Set(favoriteSpaceIds); newFavs.delete(spaceId); setFavoriteSpaceIds(newFavs); }
  };
  const handleToggleFavorite = (spaceId: string) => {

    const newFavs = new Set(favoriteSpaceIds);
    if (newFavs.has(spaceId)) newFavs.delete(spaceId);
    else newFavs.add(spaceId);
    setFavoriteSpaceIds(newFavs);
  };

  const handleTabChange = (tab: string) => {

    setActiveTab(tab);
    setIsSpacesMobileOpen(false); setIsNotificationsMobileOpen(false); setIsFavoritesMobileOpen(false);
    if (tab === 'spaces') setIsSpacesMobileOpen(true);
    else if (tab === 'notifications') setIsNotificationsMobileOpen(true);
    else if (tab === 'favorites') setIsFavoritesMobileOpen(true);
  };
  const closeOverlays = () => {

    setIsSpacesMobileOpen(false); setIsNotificationsMobileOpen(false); setIsFavoritesMobileOpen(false); setActiveTab('board');
  };

  const addToHistory = (description: string, details: string, type: 'manual' | 'automatic' = 'manual', cardId?: string) => {
      const newEntry: ChangeLogEntry = { id: Date.now().toString(), type, description, user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=seiroo' }, timestamp: new Date().toISOString(), details, cardId };
      setHistory(prev =>[newEntry, ...prev]);
  };
  const handleOpenCardFromHistory = (cardId: string) => {

      let foundCard: Card | undefined;
      for (const col of columns) { foundCard = col.cards.find(c => c.id === cardId); if (foundCard) break; }
      if (foundCard) { setSelectedCard(foundCard); setIsHistoryOpen(false); } else { alert('Issue not found (it might have been deleted).'); }
  };
  const handleUpdateCard = (updatedCard: Card) => {

    const newColumns = columns.map(col => ({ ...col, cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c) }));
    setColumns(newColumns);
  };
  const handleDeleteCard = (cardId: string) => {

      let cardTitle = 'Unknown Card'; let cardNumber = 0;
      for (const col of columns) {
          const card = col.cards.find(c => c.id === cardId);
          if (card) { cardTitle = card.title; cardNumber = card.number; break; }
      }
      const newColumns = columns.map(col => ({ ...col, cards: col.cards.filter(c => c.id !== cardId) }));
      setColumns(newColumns);
      addToHistory(`Deleted issue #${cardNumber}`, `Deleted card: "${cardTitle}" (ID: ${cardId})`, 'manual');
  };

  const handleMoveCard = async (cardId: string, sourceColumnId: string, targetColumnId: string) => {

    if (sourceColumnId === targetColumnId) return;

    setColumns(prevColumns => {

      const sourceCol = prevColumns.find(col => col.id === sourceColumnId);
      if (!sourceCol) return prevColumns;
      const cardToMove = sourceCol.cards.find(card => card.id === cardId);
      if (!cardToMove) return prevColumns;

      return prevColumns.map(col => {

        if (col.id === sourceColumnId) return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
        if (col.id === targetColumnId) return { ...col, cards:[...col.cards, cardToMove] };
        return col;
      });
    });

    try {

        await vortexApi.moveCardManual(cardId, targetColumnId);
        addToHistory(`Moved issue from User Interaction`, `Card id ${cardId} to column ${targetColumnId}`, 'manual');
    } catch (error) {
        console.error("Fallo moviendo la carta en el Backend D:", error);
    }
  };

  const handleUpdateColumn = (updatedColumn: Column) => setColumns(columns.map(col => col.id === updatedColumn.id ? updatedColumn : col));

  const handleAddColumn = async (newColumnData: Omit<Column, 'cards'>) => {

    if (!spaces || spaces.length === 0) return; 
    
    const currentSpaceId = spaces[0].id; 

    try {

        const savedColumnDB = await vortexApi.createColumn(
             currentSpaceId, 
             newColumnData.title, 
             newColumnData.keyword || newColumnData.title.substring(0,5),
             newColumnData.color
        );
        
        const newColumn: Column = { ...savedColumnDB, cards: [] };
        setColumns([...columns, newColumn]);

    } catch(error) {

         console.error("No se pudo guardar la columna", error);
    }
  };

  const { availableTags, availableAssignees } = useMemo(() => {

    const tagsMap = new Map<string, Tag>();
    const assigneesSet = new Set<string>();
    columns.forEach(col => { col.cards.forEach(card => {

        card.tags.forEach(tag => tagsMap.set(tag.label, tag));
        if (card.assignees) { card.assignees.forEach(a => assigneesSet.add(a)); }
    }); });
    return { availableTags: Array.from(tagsMap.values()), availableAssignees: Array.from(assigneesSet), };
  }, [columns]);

  const filteredColumns = useMemo(() => {

    return columns.map(column => ({

      ...column,
      cards: column.cards.filter(card => {

        if (filters.statuses.length > 0 && !filters.statuses.includes(column.id)) return false; 
        if (filters.tags.length > 0) {

          const cardTagLabels = card.tags.map(t => t.label);
          if (!filters.tags.some(filterTag => cardTagLabels.includes(filterTag))) return false;
        }
        if (filters.assignees.length > 0) {

          const cardAssignees = card.assignees ||[];
          if (!filters.assignees.some(filterAssignee => cardAssignees.includes(filterAssignee))) return false;
        }
        return true;
      })
    }));
  }, [filters, columns]);

  const totalDisplayedCards = filteredColumns.reduce((acc, col) => acc + col.cards.length, 0);
  const displayCount = filters.tags.length + filters.statuses.length + filters.assignees.length > 0 ? totalDisplayedCards : 17;

  return (
    <div className="fixed inset-0 flex flex-col font-sans text-sm text-neutral-900 dark:text-neutral-200 bg-white dark:bg-[#161618] overflow-hidden transition-colors duration-200">
      
      <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-gray-50 dark:bg-[#111113] z-20 transition-colors duration-200">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button onClick={toggleSidebar} className="hidden md:flex items-center justify-center w-8 h-8 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"><i className="fa-solid fa-bars text-xs"></i></button>
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"><img src="https://imgur.com/IwlhiR1.png" alt="Logo" className="w-full h-full object-cover" /></div>
            
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 flex-shrink-0">
                <i className="fa-brands fa-github text-neutral-500 dark:text-neutral-400 text-sm"></i>
                <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                <span className="hidden sm:inline text-neutral-500 font-medium hover:underline cursor-pointer">seiroo</span>
                <span className="hidden sm:inline text-neutral-400 dark:text-neutral-600">/</span>
                <b className="text-neutral-900 dark:text-neutral-200 font-semibold truncate hover:underline cursor-pointer">{spaces.length > 0 ? spaces[0].name : "vortex"}</b>
                </div>
            </div>
          </div>
          
          <button className="md:hidden flex-shrink-0 ml-auto mr-2"><img src="https://i.pravatar.cc/150?u=seiroo" alt="Profile" className="w-8 h-8 rounded-full border border-neutral-700 object-cover" /></button>
          <div className="flex items-center gap-2.5">
            <div className="relative group flex-1 md:flex-none"><i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs group-focus-within:text-blue-500 transition-colors"></i><input type="text" placeholder="Search issues..." className="w-full md:w-48 lg:w-64 bg-gray-100 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-600 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600 text-sm text-neutral-900 dark:text-neutral-300" /></div>
            <div className="hidden md:flex items-center gap-2.5">
                <div className="relative"><button ref={filterButtonRef} onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300"><i className="fa-solid fa-filter text-neutral-500 text-xs"></i><span>Filter</span><span className="bg-gray-200 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[10px] px-1.5 rounded-full ml-0.5 min-w-[18px] text-center">{displayCount}</span></button>{isFilterOpen && <FilterMenu triggerRef={filterButtonRef} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={setFilters} availableTags={availableTags} availableAssignees={availableAssignees} columns={columns} />}</div>
                <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300"><i className="fa-solid fa-clock-rotate-left text-neutral-500 text-xs"></i><span>History changes</span><i className="fa-solid fa-chevron-down text-[10px] text-neutral-500 ml-1"></i></button>
                <button onClick={() => setIsCreateColumnModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300"><i className="fa-solid fa-table-columns text-xs text-neutral-500"></i><span>Add column</span></button>
                <div className="relative ml-2"><button ref={profileButtonRef} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="shrink-0"><img src="https://i.pravatar.cc/150?u=seiroo" alt="Profile" className="w-8 h-8 rounded-full border border-neutral-700 object-cover hover:border-neutral-500 transition-colors" /></button>{isProfileMenuOpen && <ProfileMenu triggerRef={profileButtonRef} onClose={() => setIsProfileMenuOpen(false)} onSignOut={() => setIsProfileMenuOpen(false)} theme={theme} onToggleTheme={toggleTheme}/>}</div>
            </div>
          </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        <div className="hidden md:flex h-full">
            <Sidebar spaces={spaces} invitedSpaces={invitedSpaces} favoriteSpaceIds={favoriteSpaceIds} onUpdateSpace={handleUpdateSpace} onDeleteSpace={handleDeleteSpace} onCreateSpace={handleCreateSpace} onToggleFavorite={handleToggleFavorite} isCollapsed={!isSidebarOpen} />
        </div>

        <main className="flex-1 flex flex-col bg-white dark:bg-[#161618] min-w-0 relative overflow-hidden transition-colors duration-200">
            <KanbanBoard columns={filteredColumns} onCardMove={handleMoveCard} onColumnUpdate={handleUpdateColumn} onCardUpdate={handleUpdateCard} onCardDelete={handleDeleteCard} selectedCard={selectedCard} onCardSelect={setSelectedCard} />
            <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
            {isSpacesMobileOpen && <SpacesMobileOverlay spaces={spaces} onClose={closeOverlays} onSelectSpace={() => closeOverlays()}/>}
            {isNotificationsMobileOpen && <NotificationsMobileOverlay onClose={closeOverlays}/>}
            {isFavoritesMobileOpen && <FavoritesMobileOverlay spaces={spaces} favoriteSpaceIds={favoriteSpaceIds} onClose={closeOverlays} onSelectSpace={() => closeOverlays()} onRemoveFavorite={handleToggleFavorite}/>}
        </main>

      </div>
      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} history={history} onOpenCard={handleOpenCardFromHistory}/>}
      {isCreateColumnModalOpen && <CreateColumnModal onClose={() => setIsCreateColumnModalOpen(false)} onSave={handleAddColumn}/>}
    </div>
  );
};

export default App;