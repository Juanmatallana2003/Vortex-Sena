"use client";

import React, { useMemo, useState } from 'react';
import { Space } from '../types';
import { vortexApi } from '../api';
import { DEFAULT_AVATAR_SRC, handleAvatarError } from './Avatar';

interface MembersModalProps {
  space: Space;
  onClose: () => void;
  // Añadimos esta función para que el Modal avise a page.tsx que hay un nuevo miembro
  onMemberAdded: (updatedSpace: Space) => void; 
}

interface GithubUserPreview {
  login: string;
  avatar_url: string;
}

const MembersModal: React.FC<MembersModalProps> = ({ space, onClose, onMemberAdded }) => {
  const[searchTerm, setSearchTerm] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const[inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const normalizedSearchTerm = searchTerm.trim();
  const isEmailInput = searchTerm.includes('@') && searchTerm.includes('.');
  const githubUserPreview = useMemo<GithubUserPreview | null>(() => {
      if (isEmailInput || normalizedSearchTerm.length <= 2) return null;

      return {
          login: normalizedSearchTerm,
          avatar_url: `https://github.com/${normalizedSearchTerm}.png`
      };
  }, [isEmailInput, normalizedSearchTerm]);

  // La lista de miembros vivos ahora viene directamente de PostgreSQL a través del prop 'space'
  const activeMembers = space.members ||[];

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const executeInvitation = async (inputData: string, type: 'email' | 'github', avatarData: string) => {
      setIsInviting(true);
      try {
          // Guardamos físicamente en la Base de Datos Java
          const savedMember = await vortexApi.inviteMember(space.id, inputData, type, avatarData);
          
          // Actualizamos el "Space" original para que page.tsx lo sepa
          const updatedSpace = { ...space, members: [savedMember, ...(space.members || [])] };
          onMemberAdded(updatedSpace);

          setSearchTerm('');
          setInviteSuccess(`¡Invitación exitosa a ${inputData}!`);
          setTimeout(() => setInviteSuccess(null), 3000);
      } catch (error) {
          console.error("Error backend al invitar", error);
          alert("Hubo un fallo contactando al servidor de base de datos.");
      }
      setIsInviting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-[20px] w-full max-w-md flex flex-col animate-scale-in shadow-2xl relative overflow-hidden"
        onClick={handleModalContentClick}
      >
        
        {inviteSuccess && (
            <div className="absolute top-0 left-0 right-0 bg-[#2ea043] text-white text-xs font-bold text-center py-2 animate-fade-in z-50">
                {inviteSuccess}
            </div>
        )}

        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-neutral-900 dark:text-neutral-100">Gestor de Colaboradores</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5 tracking-wider uppercase font-semibold">Base Activa: <span className="text-blue-500 dark:text-blue-400">{space.name}</span></p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"><i className="fa-solid fa-times"></i></button>
        </div>

        <div className="p-6">
          <div className="relative mb-3">
            <i className="fa-solid fa-user-plus absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-xs"></i>
            <input 
              type="text"
              placeholder="Ingresa un correo o busca un @Usuario GitHub..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2.5 text-[13px] font-medium text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-blue-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
            />
          </div>

          <div className="min-h-[60px] mb-4">
              {isEmailInput && (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 p-2 rounded-lg animate-fade-in">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/40 rounded-full flex items-center justify-center text-blue-500">
                              <i className="fa-solid fa-envelope"></i>
                          </div>
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 truncate w-40">{searchTerm}</span>
                      </div>
                      <button 
                         disabled={isInviting}
                         onClick={() => executeInvitation(searchTerm, 'email', 'https://ui-avatars.com/api/?name=Mail&background=0D8ABC&color=fff')}
                         className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md transition-all active:scale-95 disabled:opacity-50"
                      >
                         {isInviting ? <i className="fa-solid fa-spinner fa-spin"></i> : "Invitar por Correo"}
                      </button>
                  </div>
              )}

              {githubUserPreview && !isEmailInput && (
                   <div className="flex items-center justify-between bg-neutral-100 dark:bg-[#1f1f22] border border-neutral-200 dark:border-neutral-700/50 p-2 rounded-lg animate-fade-in">
                      <div className="flex items-center gap-3">
                          <img src={githubUserPreview.avatar_url || DEFAULT_AVATAR_SRC} alt="Git" className="w-8 h-8 rounded-full border border-neutral-600 object-cover" 
                               onError={handleAvatarError}/>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">@{githubUserPreview.login}</span>
                              <span className="text-[9px] uppercase tracking-widest text-neutral-500">Cuenta Github</span>
                          </div>
                      </div>
                      <button 
                         disabled={isInviting}
                         onClick={() => executeInvitation(githubUserPreview.login, 'github', githubUserPreview.avatar_url)}
                         className="px-3 py-1.5 bg-[#2ea043] hover:bg-[#2c974b] text-white text-xs font-bold rounded-md flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                      >
                         {isInviting ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-brands fa-github"></i>Vincular</>}
                      </button>
                  </div>
              )}
          </div>
          
          <div className="flex items-center justify-between mb-3 border-t border-neutral-200 dark:border-neutral-800 pt-4">
             <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
               Miembros de la BD ({activeMembers.length})
             </h3>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
             {activeMembers.length > 0 ? (
                 activeMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 dark:bg-[#121213] p-2.5 rounded-xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                        <img 
                           src={member.avatarUrl || DEFAULT_AVATAR_SRC} 
                           alt={member.name} 
                           onError={handleAvatarError}
                           className="w-9 h-9 rounded-full border border-neutral-300 dark:border-neutral-600 object-cover bg-white" 
                        />
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center w-full">
                                <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">{member.name}</span>
                                <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Activo</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-medium">
                                <span className="text-blue-600 dark:text-blue-400">{member.username}</span>
                                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                                <span className="text-neutral-500 truncate max-w-[120px]">{member.email}</span>
                            </div>
                        </div>
                    </div>
                 ))
             ) : (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-500 dark:text-neutral-600 space-y-3">
                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800/50 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-users-slash text-xl opacity-60"></i>
                    </div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold opacity-70">Lista vacía en Servidor</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
