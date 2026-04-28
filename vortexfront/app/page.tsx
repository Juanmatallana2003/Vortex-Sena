"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import {AppNotification, Card, ChangeLogEntry, Column, FilterState, Space, Tag} from "@/types";
import FilterMenu from "@/components/FilterMenu";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import MobileNav from "@/components/MobileNav";
import SpacesMobileOverlay from "@/components/SpacesMobileOverlay";
import NotificationsMobileOverlay from "@/components/NotificationsMobileOverlay";
import FavoritesMobileOverlay from "@/components/FavoritesMobileOverlay";
import HistoryModal from "@/components/HistoryModal";
import CreateColumnModal from "@/components/CreateColumnModal";
import LoginProtectionOverlay from "@/components/LoginProtectionOverlay"; 
import { vortexApi } from "@/api";
import ToastNotification, { ToastType } from "@/components/ToastNotification";

const INITIAL_HISTORY_LOG: ChangeLogEntry[] =[{ id: '1', type: 'manual', description: 'Started initial development board log.', user: { name: 'Creator', avatar: 'https://i.pravatar.cc/40?u=a' }, timestamp: new Date().toISOString(), details: 'Sistema montado exitosamente en Postgres.', cardId: 'sys-start'}];

type ApiCard = Omit<Card, 'number' | 'tags'> & {
    issueNumber?: number;
    number?: number;
    tags?: Tag[];
};

type ApiColumn = Omit<Column, 'cards'> & {
    cards?: ApiCard[];
};

type WorkspaceWithApiColumns = Omit<Space, 'columns'> & {
    columns?: ApiColumn[];
};

interface ProfileMenuProps { 
    onClose: () => void; 
    onSignOut: () => void; 
    theme: 'light' | 'dark'; 
    onToggleTheme: () => void; 
    triggerRef?: React.RefObject<HTMLElement | null>; 
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onSignOut, theme, onToggleTheme, triggerRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node) && (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))) { onClose(); } }; document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; },[onClose, triggerRef]);
  return (
    <div ref={menuRef} className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 animate-scale-in overflow-hidden origin-top-right">
      <div className="p-1 space-y-1"><button onClick={onToggleTheme} className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"><div className="flex items-center gap-2"><i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i><span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span></div><div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-500' : 'bg-neutral-400'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} style={{ left: theme === 'dark' ? '18px' : '2px' }}></div></div></button><div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1"></div><a href="http://localhost:8080/api/logout" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-md transition-colors text-left"><i className="fa-solid fa-arrow-right-from-bracket"></i><span>Cerrar sesión Segura</span></a></div>
    </div>
  );
};

export default function App() {
  const[isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{name: string, avatar: string} | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const[isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const[isSpacesMobileOpen, setIsSpacesMobileOpen] = useState(false);
  const[isNotificationsMobileOpen, setIsNotificationsMobileOpen] = useState(false);
  const[isFavoritesMobileOpen, setIsFavoritesMobileOpen] = useState(false);
  const[notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);
  
  const [columns, setColumns] = useState<Column[]>([]); 
  const [filters, setFilters] = useState<FilterState>({ tags: [], statuses:[], assignees:[], });
  
  const[isFilterOpen, setIsFilterOpen] = useState(false);
  const[isHistoryOpen, setIsHistoryOpen] = useState(false);
  const[isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const[isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const[theme, setTheme] = useState<'light' | 'dark'>('dark');
  const[history, setHistory] = useState<ChangeLogEntry[]>(INITIAL_HISTORY_LOG);
  const[selectedCard, setSelectedCard] = useState<Card | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const [spaces, setSpaces] = useState<Space[]>([]);
  const invitedSpaces: Space[] = [];
  const[favoriteSpaceIds, setFavoriteSpaceIds] = useState<Set<string>>(new Set());

  const[activeWorkspaceSelectedTracker, setActiveWorkspaceSelectedTracker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sistema de Alertas Globales (Toasts)
  const [toasts, setToasts] = useState<{ id: string, message: string, type: ToastType }[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const newToast = { id: Date.now().toString(), message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const normalizeColumnsFromWorkspace = (workspace: WorkspaceWithApiColumns): Column[] => {
    if (!workspace.columns) return [];

    return workspace.columns.map((col) => ({
      ...col,
      cards: col.cards ? col.cards.map((c) => ({
        ...c,
        number: c.issueNumber || c.number || 0,
        tags: c.tags || [],
        assignees: c.assignees || [],
        dueDate: c.dueDate || ''
      })) : []
    }));
  };

  const refreshNotificationsUnreadCount = async () => {
    try {
      const unreadCount = await vortexApi.getUnreadNotificationsCount();
      setNotificationsUnreadCount(unreadCount);
    } catch (err) {
      setNotificationsUnreadCount(0);
    }
  };

  useEffect(() => {
    const checkSecurityWall = async () => {
        try {
            const userData = await vortexApi.getCurrentUser();
            if (userData.authenticated) {
                setIsAuthenticated(true);
                setUserProfile({ name: userData.name, avatar: userData.avatar });
                // eslint-disable-next-line react-hooks/immutability
                await fetchVortexData(); 
                await refreshNotificationsUnreadCount();
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false); 
        }
        setIsLoadingAuth(false);
    };
    checkSecurityWall();
  },[]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const stream = new EventSource(vortexApi.getEventsStreamUrl(), { withCredentials: true });
    const refreshOnNotificationEvent = () => refreshNotificationsUnreadCount();

    stream.addEventListener('notification_created', refreshOnNotificationEvent);
    stream.addEventListener('notification_updated', refreshOnNotificationEvent);

    return () => {
      stream.removeEventListener('notification_created', refreshOnNotificationEvent);
      stream.removeEventListener('notification_updated', refreshOnNotificationEvent);
      stream.close();
    };
  }, [isAuthenticated]);

  // ======== ⚡ CARGAMOS LOS FAVORITOS AL INICIO ========
  async function fetchVortexData() {
    try {
        const [workspacesData, favoritesData] = await Promise.all([
            vortexApi.getWorkspaces(),
            vortexApi.getFavoriteSpaces()
        ]);

        if (favoritesData) {
            setFavoriteSpaceIds(new Set(favoritesData.map((s: Space) => s.id)));
        }

        if (workspacesData && workspacesData.length > 0) {
           setSpaces(workspacesData); 
           setActiveWorkspaceSelectedTracker(workspacesData[0].id);

           if (workspacesData[0].columns) {
               setColumns(normalizeColumnsFromWorkspace(workspacesData[0])); 
           }
           
           try {
               const workspaceHistory = await vortexApi.getWorkspaceHistory(workspacesData[0].id);
               setHistory(workspaceHistory);
           } catch (err) {
               setHistory([]); 
           }
        }
    } catch (e) {
        console.error("Error API Frontend", e);
    }
  }

  const getFilteredCurrentColumnsDataPerWorkspaceSelectToFrontendBoard = async (wID :string) => {
       const wSForNavArrayMemoryLocalDataExtractedOrSearchedToBackAPI = spaces.find(eleW => eleW.id === wID);
       if (wSForNavArrayMemoryLocalDataExtractedOrSearchedToBackAPI) {
           if (wSForNavArrayMemoryLocalDataExtractedOrSearchedToBackAPI.columns) {
               setColumns(normalizeColumnsFromWorkspace(wSForNavArrayMemoryLocalDataExtractedOrSearchedToBackAPI)); 
           } else { setColumns([]); }
       }
       
       try {
           const workspaceHistory = await vortexApi.getWorkspaceHistory(wID);
           setHistory(workspaceHistory);
       } catch (err) {
           setHistory([]); 
       }
  }

  useEffect(() => { if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [theme]);
  const toggleTheme = () => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); };
  const toggleSidebar = () => { setIsSidebarOpen(!isSidebarOpen); };
  
  const handleCreateSpace = async (spaceName: string, repoUrl: string, defaultBranch: string) => { 
     try { 
         const newSpaceDB = await vortexApi.createWorkspace(spaceName, repoUrl, defaultBranch); 
         const newSpace: Space = { ...newSpaceDB, icon: 'fa-regular fa-folder', columns:[] }; 
         setSpaces([...spaces, newSpace]);
         setActiveWorkspaceSelectedTracker(newSpace.id);
         setColumns([]); 
     } catch(err) { console.error(err); } 
  };

  const handleUpdateSpace = async (updatedSpace: Space) => {
    setSpaces(spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s));
    try {
        await vortexApi.updateWorkspace(updatedSpace.id, updatedSpace.name, updatedSpace.repoUrl || "", updatedSpace.defaultBranch || "");
    } catch (err) {
        console.error("Error al actualizar el espacio en BD", err);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    setSpaces(spaces.filter(s => s.id !== spaceId));
    
    if (favoriteSpaceIds.has(spaceId)) { 
        const newFavs = new Set(favoriteSpaceIds); 
        newFavs.delete(spaceId); 
        setFavoriteSpaceIds(newFavs); 
    }

    try {
        await vortexApi.deleteWorkspace(spaceId);
        if (activeWorkspaceSelectedTracker === spaceId) {
            setColumns([]); 
        }
    } catch(err) {
        console.error("Error borrando el espacio", err);
    }
  };

  // ======== ⚡ MARCAR O DESMARCAR COMO FAVORITO (BD + UI) ========
  const handleToggleFavorite = async (spaceId: string) => { 
      // 1. Actualización Visual Optimista (UI)
      const newFavs = new Set(favoriteSpaceIds); 
      if (newFavs.has(spaceId)) { 
          newFavs.delete(spaceId); 
      } else { 
          newFavs.add(spaceId); 
      } 
      setFavoriteSpaceIds(newFavs); 

      // 2. Persistir en la Nube (DB)
      try {
          await vortexApi.toggleFavoriteSpace(spaceId);
      } catch (err) {
          console.error("Error al sincronizar favorito con BD", err);
          // Si falla, en un sistema real revertiríamos el estado visual aquí.
      }
  };

  const closeOverlays = () => {
      setIsSpacesMobileOpen(false);
      setIsNotificationsMobileOpen(false);
      setIsFavoritesMobileOpen(false);
      setActiveTab('board');
  };

  const openNotificationsPanel = () => {
      setIsSpacesMobileOpen(false);
      setIsFavoritesMobileOpen(false);
      setIsNotificationsMobileOpen(true);
      setActiveTab('notifications');
  };

  const handleTabChange = (tab: string) => {
      if (tab === 'spaces') {
          setIsNotificationsMobileOpen(false);
          setIsFavoritesMobileOpen(false);
          setIsSpacesMobileOpen(true);
          setActiveTab('spaces');
      } else if (tab === 'notifications') {
          openNotificationsPanel();
      } else if (tab === 'favorites') {
          setIsSpacesMobileOpen(false);
          setIsNotificationsMobileOpen(false);
          setIsFavoritesMobileOpen(true);
          setActiveTab('favorites');
      } else {
          closeOverlays();
      }
  };

  const handleOpenNotificationCard = (notification: AppNotification) => {
      if (!notification.cardId) {
          closeOverlays();
          return;
      }

      let columnsToSearch = columns;

      if (notification.workspaceId && notification.workspaceId !== activeWorkspaceSelectedTracker) {
          const targetWorkspace = spaces.find(space => space.id === notification.workspaceId);
          if (targetWorkspace) {
              columnsToSearch = normalizeColumnsFromWorkspace(targetWorkspace);
              setActiveWorkspaceSelectedTracker(targetWorkspace.id);
              setColumns(columnsToSearch);
              vortexApi.getWorkspaceHistory(targetWorkspace.id).then(setHistory).catch(() => setHistory([]));
          }
      }

      const foundCard = columnsToSearch.flatMap(column => column.cards).find(card => card.id === notification.cardId);
      if (foundCard) {
          setSelectedCard(foundCard);
      } else {
          showToast("La tarjeta vinculada no esta cargada en este tablero.", "info");
      }

      closeOverlays();
  };
  
  const addToHistory = async (description: string, details: string, type: 'manual' | 'automatic' = 'manual', cardId?: string) => { 
      if (!activeWorkspaceSelectedTracker) return;

      const logData = {
          type,
          description,
          details,
          cardId,
          user: { 
              name: userProfile?.name || 'Vortex User', 
              avatar: userProfile?.avatar || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' 
          }
      };

      try {
          const savedLog = await vortexApi.addHistoryLog(activeWorkspaceSelectedTracker, logData);
          const newEntry: ChangeLogEntry = { 
              id: savedLog.id || Date.now().toString(), 
              type, 
              description, 
              user: logData.user, 
              timestamp: savedLog.timestamp || new Date().toISOString(), 
              details, 
              cardId 
          }; 
          setHistory(prev =>[newEntry, ...prev]); 
      } catch (err) {
          console.error("Error guardando el log de historia", err);
      }
  };

  const handleOpenCardFromHistory = (cardId: string) => { let foundCard: Card | undefined; for (const col of columns) { foundCard = col.cards.find(c => c.id === cardId); if (foundCard) break; } if (foundCard) { setSelectedCard(foundCard); setIsHistoryOpen(false); } else { alert('Issue no encontrado.'); } };
  const handleAddCardFunctionVisual = async (cId: string, iTit: string) => { const genIdLocalNumber = Math.floor(Math.random() * 800) + 15; try { const bdR = await vortexApi.createCard(cId, genIdLocalNumber, iTit, "Nueva task manual"); setColumns(prevList => prevList.map(colD => colD.id === cId ? {...colD, cards:[{...bdR, number:bdR.issueNumber||genIdLocalNumber, tags:[]}, ...colD.cards]} : colD)); addToHistory("Visual Input Card.", `Nuevo Creado`, 'manual')} catch(err) { } };
  const handleUpdateCard = async (updatedCard: Card) => { setColumns(c => c.map(c1 => ({ ...c1, cards: c1.cards.map(c2 => c2.id === updatedCard.id ? updatedCard : c2) }))); try { await vortexApi.updateCardDetails(updatedCard.id, updatedCard.title, updatedCard.description||"", updatedCard.dueDate, updatedCard.assignees, updatedCard.tags); addToHistory(`Card Details Edited`, `El usuario modificó los detalles de la tarea`, 'manual', updatedCard.id); } catch(err) { console.error("Fallo contactando API para update:", err); } };
  const handleDeleteCard = async (cardId: string) => { let cardTitle = 'Unknown Card'; let cardNumber = 0; for (const col of columns) { const card = col.cards.find(c => c.id === cardId); if (card) { cardTitle = card.title; cardNumber = card.number; break; } } setColumns(c => c.map(c1 => ({ ...c1, cards: c1.cards.filter(c2 => c2.id !== cardId) }))); try { await vortexApi.deleteCard(cardId); } catch (err) {} addToHistory(`Deleted issue #${cardNumber}`, `Deleted card: "${cardTitle}"`, 'manual'); };

  const handleMoveCard = async (cardId: string, sourceColumnId: string, targetColumnId: string) => { 
      if (sourceColumnId === targetColumnId) return; 

      // 1. Guardamos el estado ANTERIOR por si todo falla
      const previousColumnsState = [...columns];

      // 2. Optimistic UI
      setColumns(prevColumns => { 
          const sourceCol = prevColumns.find(col => col.id === sourceColumnId); 
          if (!sourceCol) return prevColumns; 
          
          const cardToMove = sourceCol.cards.find(card => card.id === cardId); 
          if (!cardToMove) return prevColumns; 
          
          return prevColumns.map(col => { 
              if (col.id === sourceColumnId) { return { ...col, cards: col.cards.filter(card => card.id !== cardId) }; } 
              if (col.id === targetColumnId) { return { ...col, cards: [cardToMove, ...col.cards] }; } 
              return col; 
          }); 
      }); 

      // 3. Persistir en la BD con Rollback
      try { 
          await vortexApi.moveCardManual(cardId, targetColumnId); 
          addToHistory(`Moved card status manually`, `User dragged issue.`, 'manual'); 
          showToast("Tarjeta movida con éxito", "success"); 
      } catch(err){
          console.error("VORTEX ERROR: Falla crítica de sincronización.", err);
          // 4. ROLLBACK: El servidor falló, revertimos visualmente
          setColumns(previousColumnsState);
          showToast("Error de conexión. La tarjeta volvió a su lugar original.", "error");
      } 
  };
  const handleColumnReorder = async (draggedColumnId: string, targetColumnId: string) => { if (!activeWorkspaceSelectedTracker || draggedColumnId === targetColumnId) return; setColumns(prevColumns => { const newColumns = [...prevColumns]; const draggedIndex = newColumns.findIndex(c => c.id === draggedColumnId); const targetIndex = newColumns.findIndex(c => c.id === targetColumnId); if (draggedIndex === -1 || targetIndex === -1) return prevColumns; const [draggedColumn] = newColumns.splice(draggedIndex, 1); newColumns.splice(targetIndex, 0, draggedColumn); const orderedIds = newColumns.map(col => col.id); vortexApi.reorderColumns(activeWorkspaceSelectedTracker, orderedIds).catch(err => { console.error("Error sincronizando orden:", err); }); return newColumns; }); };
  const handleAddColumn = async (newColumnData: Omit<Column, 'cards'>) => { const targetWorkspace = activeWorkspaceSelectedTracker || (spaces.length > 0 ? spaces[0].id : null); if (!targetWorkspace) { alert("Atención: Inicie o Genere un Proyecto primero."); return; } try { const resFromBDCloud = await vortexApi.createColumn( targetWorkspace, newColumnData.title.trim(), newColumnData.keyword ? newColumnData.keyword.trim() : newColumnData.title.substring(0,6), newColumnData.color ); const parsedColFromApi: Column = { ...resFromBDCloud, cards:[] }; setColumns(prevAllCols =>[...prevAllCols, parsedColFromApi]); addToHistory(`Board Scaled`, `Columna nueva:[${parsedColFromApi.title}]`, 'automatic'); } catch(e){ console.error("VORTEX SERVER-SYNC ERROR : Falló envío Cloud HTTP", e); } };
  const handleUpdateColumn = async (updatedColumn: Column) => { setColumns(columns.map(col => col.id === updatedColumn.id ? updatedColumn : col)); try { await vortexApi.updateColumnDataBD(updatedColumn.id, updatedColumn); } catch(err) { console.error("Error de sincronización", err); } };

  const { availableTags, availableAssignees } = useMemo(() => { const tagsMap = new Map<string, Tag>(); const assigneesSet = new Set<string>(); columns.forEach(col => { col.cards.forEach(card => { card.tags.forEach(tag => tagsMap.set(tag.label, tag)); if (card.assignees) { card.assignees.forEach(a => assigneesSet.add(a)); } }); }); return { availableTags: Array.from(tagsMap.values()), availableAssignees: Array.from(assigneesSet), }; }, [columns]);
  
  const filteredColumns = useMemo(() => {
    return columns.map(column => ({
      ...column,
      cards: column.cards.filter(card => {
        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            const titleMatch = card.title.toLowerCase().includes(lowerQuery);
            const numberMatch = card.number?.toString().includes(lowerQuery);
            const descMatch = card.description?.toLowerCase().includes(lowerQuery);
            
            if (!titleMatch && !numberMatch && !descMatch) return false;
        }

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
  },[filters, columns, searchQuery]);

  const displayCount = filteredColumns.reduce((acc, col) => acc + col.cards.length, 0);

  const userNameDeGithubReal = userProfile?.name || "Vortex User";
  const userAvatarReal = userProfile?.avatar || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

  return (
    <div className="fixed inset-0 h-screen w-screen flex flex-col font-sans text-sm text-neutral-900 dark:text-neutral-200 bg-white dark:bg-[#161618] overflow-hidden transition-colors duration-200">
      
      <LoginProtectionOverlay isLoading={isLoadingAuth} isAuthenticated={isAuthenticated} githubOauthUrl="http://localhost:8080/oauth2/authorization/github" />

      <div className={`flex flex-col h-screen w-full flex-1 ${!isAuthenticated && "opacity-[0.80] filter blur-[4px] saturate-[0.8] grayscale-[0.20] pointer-events-none scale-105"}`}>
          
          <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-gray-50 dark:bg-[#111113] z-20 transition-colors duration-200">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden"><button onClick={toggleSidebar} className="hidden md:flex items-center justify-center w-8 h-8 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"><i className="fa-solid fa-bars text-xs"></i></button><div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"><img src="https://imgur.com/IwlhiR1.png" alt="Logo" className="w-full h-full object-cover" /></div><div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 flex-shrink-0"><i className="fa-brands fa-github text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                 <span className="hidden sm:inline text-neutral-500 font-medium hover:underline cursor-pointer tracking-wide">{userNameDeGithubReal}</span>
                 <span className="hidden sm:inline text-neutral-400 dark:text-neutral-600">/</span><b className="text-neutral-900 dark:text-neutral-200 font-semibold truncate hover:underline cursor-pointer">{ activeWorkspaceSelectedTracker ? ( spaces.find(i=>i.id===activeWorkspaceSelectedTracker)?.name ) : "Vortex Kanban"}</b></div></div></div>
              
              <button className="md:hidden flex-shrink-0 ml-auto mr-2"><img src={isAuthenticated ? userAvatarReal : "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} alt="Profile" className="w-8 h-8 rounded-full border border-neutral-700 object-cover" /></button>
              
              <div className="flex items-center gap-2.5">
                <div className="relative group flex-1 md:flex-none">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs group-focus-within:text-blue-500 transition-colors"></i>
                    <input 
                        type="text" 
                        placeholder="Buscar ticket..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-48 lg:w-64 bg-gray-100 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-600 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all placeholder:text-neutral-500 dark:placeholder:text-neutral-600 text-sm text-neutral-900 dark:text-neutral-300" 
                    />
                </div>
                <div className="hidden md:flex items-center gap-2.5">
                    <div className="relative">
                        <button ref={filterButtonRef} onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300`}>
                            <i className="fa-solid fa-filter text-neutral-500 text-xs"></i><span>Filtros</span><span className="bg-gray-200 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[10px] px-1.5 rounded-full ml-0.5 min-w-[18px] text-center">{displayCount}</span>
                        </button>
                        {isFilterOpen && <FilterMenu triggerRef={filterButtonRef} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={setFilters} availableTags={availableTags} availableAssignees={availableAssignees} columns={columns}/>}
                    </div>
                    <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300"><i className="fa-solid fa-clock-rotate-left text-neutral-500 text-xs"></i><span>Historia</span><i className="fa-solid fa-chevron-down text-[10px] text-neutral-500 ml-1"></i></button>
                    <button onClick={() => setIsCreateColumnModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300" title="Añadir Columna"><i className="fa-solid fa-table-columns text-xs text-neutral-500"></i><span>Nueva Columna</span></button>
                    <button onClick={openNotificationsPanel} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202023] border border-neutral-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm text-neutral-700 dark:text-neutral-300" title="Notificaciones">
                        <i className="fa-regular fa-bell text-xs text-neutral-500"></i><span>Notificaciones</span><span className="bg-gray-200 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[10px] px-1.5 rounded-full ml-0.5 min-w-[18px] text-center">{notificationsUnreadCount > 99 ? '99+' : notificationsUnreadCount}</span>
                    </button>
                    <div className="relative ml-2">
                        <button ref={profileButtonRef} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="shrink-0 group relative overflow-hidden outline-none ring-2 ring-transparent focus:ring-blue-500/50 hover:ring-blue-500/40 rounded-full transition-all cursor-pointer shadow-md">
                            <img src={userAvatarReal} alt="Admin Profile" className="w-8 h-8 rounded-full border border-neutral-600/80 object-cover object-center scale-[1.03] group-hover:scale-105 duration-200 bg-black/5" />
                        </button>
                        {isProfileMenuOpen && <ProfileMenu triggerRef={profileButtonRef} onClose={() => setIsProfileMenuOpen(false)} onSignOut={() => setIsProfileMenuOpen(false)} theme={theme} onToggleTheme={toggleTheme}/>}
                    </div>
                </div>
              </div>
          </header>
          
          <div className="flex flex-1 overflow-hidden h-full relative z-0">
            <div className="hidden md:flex h-full relative z-50">
                <Sidebar 
                    spaces={spaces} 
                    invitedSpaces={invitedSpaces} 
                    favoriteSpaceIds={favoriteSpaceIds} 
                    onUpdateSpace={handleUpdateSpace} 
                    onDeleteSpace={handleDeleteSpace} 
                    onCreateSpace={handleCreateSpace} 
                    onToggleFavorite={handleToggleFavorite} 
                    isCollapsed={!isSidebarOpen} 
                    currentUserLoggedHeaderStringName={userNameDeGithubReal}
                    activeWorkspaceSelectionIDIdFromFrontToNav={activeWorkspaceSelectedTracker || ""}
                    onSpecificSelectorBoardActionSetterTriggeredFromSideBavUI={(tabSelectionValueNew: string) => {
                         setActiveWorkspaceSelectedTracker(tabSelectionValueNew);
                         getFilteredCurrentColumnsDataPerWorkspaceSelectToFrontendBoard(tabSelectionValueNew);
                    }}
                    onMemberAdded={handleUpdateSpace}
                />
            </div>
            <main className="flex-1 flex flex-col h-full bg-[#131315] dark:bg-[#161618] min-w-0 overflow-hidden relative z-[5]">
                <KanbanBoard columns={filteredColumns} onCardMove={handleMoveCard} onColumnUpdate={handleUpdateColumn} onCardUpdate={handleUpdateCard} onCardDelete={handleDeleteCard} selectedCard={selectedCard} onCardSelect={setSelectedCard} onAddCard={handleAddCardFunctionVisual}/>
                <MobileNav activeTab={activeTab} onTabChange={handleTabChange} notificationsUnreadCount={notificationsUnreadCount} />{isSpacesMobileOpen && <SpacesMobileOverlay spaces={spaces} onClose={closeOverlays} onSelectSpace={() => closeOverlays()}/>}{isNotificationsMobileOpen && <NotificationsMobileOverlay onClose={closeOverlays} onOpenCard={handleOpenNotificationCard} onNotificationsChanged={refreshNotificationsUnreadCount}/>}{isFavoritesMobileOpen && <FavoritesMobileOverlay spaces={spaces} favoriteSpaceIds={favoriteSpaceIds} onClose={closeOverlays} onSelectSpace={() => closeOverlays()} onRemoveFavorite={handleToggleFavorite}/>}
            </main>
          </div>
          
      </div>

      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} history={history} onOpenCard={handleOpenCardFromHistory}/>}
      {isCreateColumnModalOpen && <CreateColumnModal onClose={() => setIsCreateColumnModalOpen(false)} onSave={handleAddColumn}/>}

         {/* Contenedor Flotante de Alertas (Toasts) */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
             <ToastNotification 
                id={toast.id} 
                message={toast.message} 
                type={toast.type} 
                onClose={removeToast} 
             />
          </div>
        ))}
      </div>
    
    </div>
  );
}
