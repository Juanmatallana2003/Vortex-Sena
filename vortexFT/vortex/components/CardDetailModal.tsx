"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, Tag, WorkspaceMember } from '../types';
import Avatar from './Avatar';
import TagPill from './TagPill';
import { ALL_TAGS } from '../constants';

// ✨ ¡Inyectamos directo Al Archivo Oficial la Central Api aquí!! 
import { vortexApi } from '@/api';


interface CardDetailModalProps {
  card: Card;
  workspaceMembers?: WorkspaceMember[];
  onOpenMembers?: () => void;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete: (cardId: string) => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, workspaceMembers = [], onOpenMembers, onClose, onUpdate, onDelete }) => {

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [assignees, setAssignees] = useState<string[]>(
    (card.assignees || []).filter((assigneeId) => workspaceMembers.some((member) => member.id === assigneeId))
  );
  const [tags, setTags] = useState<Tag[]>(card.tags || []);
  const[dueDate, setDueDate] = useState(card.dueDate || '');

  // 🔔 ALERTA DE BOTON CERRADOR PARA UI 🔔 
  const [showStatusPushAlert, setStatusPushAlert] = useState<{ active: boolean, text: string }>({ active: false, text: '' });
  const [isDeployingGit, setDeployingGit] = useState<boolean>(false);

  // Dropdown states
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  
  const assigneeRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const hasWorkspaceMembers = workspaceMembers.length > 0;
  const getMemberById = (memberId: string) => workspaceMembers.find((member) => member.id === memberId);

  useEffect(() => {
      setAssignees((card.assignees || []).filter((assigneeId) => workspaceMembers.some((member) => member.id === assigneeId)));
  }, [card.assignees, workspaceMembers]);

  // Close dropdowns when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) { setIsAssigneeOpen(false); }
          if (tagRef.current && !tagRef.current.contains(event.target as Node)) { setIsTagsOpen(false); }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  },[]);


  const handleModalContentClick = (e: React.MouseEvent) => { e.stopPropagation(); };

  const handleSave = () => {
      const updatedCard: Card = {
          ...card, title: title.trim(), description: description.trim(), assignees, tags, dueDate: dueDate || undefined,
      };
      onUpdate(updatedCard);
  };

  const handleDelete = () => { onDelete(card.id); };
  
  // ======== FUNCION GATILLO A GitHub DESDE MODAL ========= //
  const HandleIssueRemoteGitClose = async () => {
       if (window.confirm("¿Segurísimo de Ejecutar Cierre en vivo de Código Remoto Github.com?\n\nEste Task Será catalogado 'COMPLETED' (Cerrado a código Github oficial por tu User.)! ")) {
            setDeployingGit(true);
            try { 
              // DISPARA LÓGICA VÍA ENDPOINT SPRING PARA TICKET ! 🔥🚀
              await vortexApi.cerrarIssueEnGithub(card.id); 

              setStatusPushAlert({active: true, text: "✅ ISSUE CLAUSURADO CORRECTAMENTE WEB!"}); 
              
              setTimeout(()=> { setStatusPushAlert({active:false, text:""}); onClose();  }, 2200);

            } catch (eroN) { 
                 console.error("VORTEX-ALERT No Respondió Git " + eroN) 
                 setDeployingGit(false);
                 setStatusPushAlert({active: true, text: "⛔ Fallo Interno Web (Status)"}); 
                 setTimeout(()=> { setStatusPushAlert({active:false, text:""})}, 2500);
            }
       }
  }


  // Toggle helpers
  const toggleAssignee = (memberId: string) => { setAssignees(prev => prev.includes(memberId) ? prev.filter(a => a !== memberId) : [...prev, memberId] ); };
  const toggleTag = (tag: Tag) => { setTags(prev => { const exists = prev.some(t => t.label === tag.label); if (exists) return prev.filter(t => t.label !== tag.label); return [...prev, tag]; }); };

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 z-[1200] flex items-center justify-center p-3 md:p-4 animate-fade-in backdrop-blur-sm overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="card-title">
      <div className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-[1100px] max-h-[92vh] flex flex-col animate-scale-in shadow-2xl relative mx-auto my-2" onClick={handleModalContentClick}>
        
        {/* Tira Banner De confirmaciones Mágico */}
        { showStatusPushAlert.active && (
              <div className="absolute top-2 right-44 z-[5000] shadow-md border-b-[3px] border-[#934ddf]  bg-purple-950 font-bold  px-6 py-2 tracking-wide font-sans rounded-xl animate-fade-in transition-all"> 
                {showStatusPushAlert.text}
              </div> 
         )
        }

        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 font-mono text-sm bg-gray-100 dark:bg-neutral-800/50 px-2 py-1 rounded">#{card.number}</span>
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Detalle Extenso Ticket ⚡</span>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={handleDelete} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded transition-colors text-sm font-medium">
                <i className="fa-solid fa-trash-can mr-2"></i>Eliminar Tarea Base
              </button>
              <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800"></div>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
                <i className="fa-solid fa-times text-lg"></i>
              </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Left Box Editor Titles / Text Areas !! */}
            <div className="flex-1 min-h-0 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800">
                <div className="space-y-6">
                    <div>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-xl font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 border-none outline-none focus:ring-0 p-0" placeholder="Escribele Modificado su Name" />
                    </div>

                    <div>
                         <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2"> Desglose Documento</label>
                        <textarea
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-56 md:h-[42vh] min-h-[180px] bg-gray-50 dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-900/20 transition-all resize-none leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                            placeholder="Anéxate acá su requerimientos / Report Code bugs log ..."
                        />
                    </div>
                </div>
            </div>

            {/* Menu SIDE Bar Rights Labels e Iconografias  !!*/}
            <div className="w-full md:w-80 min-h-0 bg-gray-50/50 dark:bg-[#161618]/50 p-6 overflow-y-auto space-y-8 flex-shrink-0">
                <div className="relative" ref={assigneeRef}>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Personas Asignadas</label>
                        <button
                          onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                          className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Asignar miembros del espacio"
                        >
                          <i className="fa-solid fa-gear"></i>
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {assignees.map((assigneeId, index) => {
                          const member = getMemberById(assigneeId);
                          if (!member) return null;
                          return (
                             <div key={`${assigneeId}-${index}`} className="relative group flex items-center gap-2 bg-white dark:bg-[#111113] border border-neutral-200 dark:border-neutral-700 rounded-full pr-2">
                                <Avatar src={member.avatarUrl} alt={member.name} />
                                <span className="text-xs text-neutral-700 dark:text-neutral-300 max-w-[90px] truncate">{member.name}</span>
                                <button onClick={() => toggleAssignee(assigneeId)} className="w-4 h-4 bg-white dark:bg-neutral-800 rounded-full text-[9px] text-neutral-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all border border-neutral-200 dark:border-neutral-600 shadow-sm"><i className="fa-solid fa-times"></i></button>
                             </div>
                          );
                        })}
                        {assignees.length === 0 && <span className="text-sm text-neutral-500 dark:text-neutral-600 italic">Sin personas asignadas</span>}
                    </div>

                    {!hasWorkspaceMembers && (
                      <div className="mt-3 rounded-xl border border-amber-300/80 dark:border-amber-500/40 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-rose-900/10 p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Aun no tienes miembros en este espacio</p>
                            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90">
                              Para asignar tareas a personas reales, primero agrega o invita miembros en <span className="font-semibold">View Members</span>.
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-amber-700/80 dark:text-amber-300/70">
                              Ruta rapida: menu del espacio, luego View Members y despues Invitar
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenMembers) onOpenMembers();
                                onClose();
                              }}
                              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-400/70 dark:border-amber-400/50 bg-amber-100/70 dark:bg-amber-500/10 hover:bg-amber-200/80 dark:hover:bg-amber-500/20 text-[11px] font-semibold text-amber-800 dark:text-amber-200 transition-colors"
                            >
                              <i className="fa-solid fa-user-plus text-[10px]"></i>
                              Ir a View Members
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isAssigneeOpen && hasWorkspaceMembers && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 animate-scale-in overflow-hidden">
                            <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              Miembros Reales del Espacio ({workspaceMembers.length})
                            </div>
                            <div className="max-h-56 overflow-y-auto p-1">
                                {workspaceMembers.map((member) => {
                                  const isSelected = assignees.includes(member.id);
                                  return (
                                    <button
                                      key={member.id}
                                      onClick={() => toggleAssignee(member.id)}
                                      className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-left"
                                    >
                                      <Avatar src={member.avatarUrl} alt={member.name} />
                                      <div className="flex-1 min-w-0">
                                        <span className={`text-sm block truncate ${isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                          {member.name}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 dark:text-neutral-500 truncate block">
                                          {member.username || member.email || "Miembro del espacio"}
                                        </span>
                                      </div>
                                      {isSelected && <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>}
                                    </button>
                                  );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={tagRef}>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lables Color </label>
                        <button onClick={() => setIsTagsOpen(!isTagsOpen)} className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><i className="fa-solid fa-gear"></i></button>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                        {tags.map((tag, index) => (<div key={index} className="relative group cursor-pointer"><TagPill tag={tag} /><button onClick={(e) => { e.stopPropagation(); toggleTag(tag); }} className="absolute -top-2 -right-2 w-5 h-5 bg-white dark:bg-neutral-800 rounded-full text-xs text-neutral-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:scale-125 transition-all border border-neutral-200 dark:border-neutral-600 shadow-sm"><i className="fa-solid fa-times"></i></button></div>))}
                        {tags.length === 0 && <span className="text-sm text-neutral-500 dark:text-neutral-600 italic">Vacias N/A Labels</span>}
                    </div>

                    {isTagsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-20 animate-scale-in overflow-hidden">
                            <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-500 dark:text-neutral-400">Config Etiquetas Board</div>
                            <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                                {ALL_TAGS.map((tag) => { const isSelected = tags.some(t => t.label === tag.label); return ( <button key={tag.label} onClick={() => toggleTag(tag)} className="flex items-center justify-between w-full p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors group"><TagPill tag={tag} />{isSelected && <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs mr-1"></i>}</button>);})}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">DUE DATE</label>
                    <div className="flex items-center gap-2 bg-white dark:bg-[#0e0e10] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group focus-within:ring-1 focus-within:ring-blue-500">
                        <i className="fa-regular fa-calendar text-neutral-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"></i>
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent text-neutral-700 dark:text-neutral-300 text-sm w-full outline-none border-none cursor-pointer placeholder:text-neutral-400 dark:placeholder:text-neutral-600" style={{ colorScheme: 'light dark' }}/>
                    </div>
                </div>

            </div>
        </div>

        {/* ---   AQUI REESTRUCTURE FINALIZADO FOOTER AÑADIENDOSE TU GRANDIOSA Y EPICA BARRA COMPLETA!! ---  */}

        <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-between gap-3 bg-gray-50 dark:bg-[#1c1c1f] rounded-b-xl flex-row w-full ">
            
             {/* 🌟 VINCULO EXTERNO API A INTERNET EN GITHUB GLOBO  ¡APLANASTELO ! */} 
             <div className="flex justify-start text-xs border dark:border-[#a056dc] shadow-[#a371df30]  border-[#692ea4]/40  shadow-[inset_0px_10px_22px_#36126620] overflow-hidden rounded-md animate-fade-in duration-[500ms]"> 
                <button
                 onClick={HandleIssueRemoteGitClose} disabled={isDeployingGit} 
                 className={` px-7 text-xs border-r-[0.8px] bg-neutral-100 hover:bg-[#b05eed] hover:text-neutral-50  text-[#161616] dark:border-[#2f2f32]  font-bold ${isDeployingGit?"animate-pulse opacity-[0.7] ": " opacity-[0.98] cursor-pointer  dark:bg-[#1e1428]/80 dark:hover:bg-[#8545e9] dark:hover:border-black   "} dark:text-[#be79fc]  tracking-[0.06rem]  transition-all `}>
                   <i className="fa-brands fa-github text-sm mr-2 opacity-[10]  "> </i> { isDeployingGit ? " Sincronizando Remoto..  "  : "CLAUSURAR Issue (WEB OFFICIAL) " }  
                </button>
             </div>


             <div className='flex gap-4' > 
             {/* Antiguo Boton Normal Local Cerrar y guardr de Datos Nulos base. Cerra UI  */}
               <button onClick={onClose} className="px-5 py-[6px]  rounded-[4px]  border-2 border-solid  border-neutral-400/20 text-xs shadow-none text-neutral-400 dark:text-neutral-400 hover:text-neutral-100 hover:border-[#b42e2e88] transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900/60 font-semibold  w-full tracking-widest leading-[18px]"> Volver atrás </button>
             
               {/* Modifico y Salvatela a postGre Solo Info Modificar sin envio api internet.    */}
               <button onClick={handleSave} className="px-5 text-sm uppercase py-2 bg-blue-600  border border-neutral-700 font-extrabold hover:bg-blue-400 text-white rounded-lg shadow-[inset_0_3px_9px_#b9bdca40]   w-full hover:scale-105 active:scale-[0.97] transition-transform  tracking-tighter"> Salvar Datos (Local Base)  </button>
             </div>
        </div>

      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default CardDetailModal;

