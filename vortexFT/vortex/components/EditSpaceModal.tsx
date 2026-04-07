"use client";

import React, { useState, useEffect } from 'react';
import { Space } from '../types';
import { vortexApi } from '../api';

interface EditSpaceModalProps {
  space: Space;
  onClose: () => void;
  onSave: (updatedSpace: Space) => void;
}

const EditSpaceModal: React.FC<EditSpaceModalProps> = ({ space, onClose, onSave }) => {
  const[spaceName, setSpaceName] = useState(space.name);
  const[selectedRepoUrl, setSelectedRepoUrl] = useState<string>(space.repoUrl || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Variables Dinámicas Reales Desde Tu Backend para Repositorios
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(true);

  // Efecto para extraer los repositorios reales del usuario logueado
  useEffect(() => {
      let isMounted = true;
      const fetchGithubRepos = async () => {
         try { 
              const repsGitFetched = await vortexApi.getGithubRealRepos();
              if (isMounted && Array.isArray(repsGitFetched)) {
                  const mappedRepos = repsGitFetched.map((ghRepo: any) => ({
                        id: ghRepo.id, 
                        name: ghRepo.full_name, 
                        url: ghRepo.html_url, 
                        isPrivate: ghRepo.private, 
                        language: ghRepo.language || 'Code' 
                  }));
                  setGithubRepos(mappedRepos);
                  setIsLoadingRepos(false); 
              }
          } catch(error) { 
              setIsLoadingRepos(false); 
              console.error("Fallo obteniendo repos para edición:", error);
          }
      }
      fetchGithubRepos();
      return () => { isMounted = false; }
  },[]);

  const handleSave = () => {
    if (spaceName.trim()) {
      onSave({
        ...space,
        name: spaceName.trim(),
        repoUrl: selectedRepoUrl || undefined,
      });
      onClose();
    }
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const filteredRepos = githubRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md flex flex-col animate-scale-in shadow-2xl"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Edit space</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <i className="fa-regular fa-folder mr-2 text-neutral-500"></i>
              Space name
            </label>
            <input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <i className="fa-brands fa-github mr-2 text-neutral-500"></i>
              Linked Repository
            </label>
            <div className="bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden flex flex-col h-40">
              <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-gray-50 dark:bg-[#0e0e10]">
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
                  <input 
                    type="text"
                    placeholder="Search repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-[#1c1c1f] border border-neutral-300 dark:border-neutral-800 rounded px-8 py-1.5 text-xs text-neutral-900 dark:text-neutral-300 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                 {isLoadingRepos ? (
                    <p className="mt-8 text-center text-xs opacity-75 text-neutral-500 font-semibold uppercase tracking-widest"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando repositorios...</p>
                 ) : filteredRepos.length > 0 ? (
                    filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepoUrl(repo.url)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md border transition-all ${
                        selectedRepoUrl === repo.url 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30' 
                          : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <i className={`fa-solid ${repo.isPrivate ? 'fa-lock' : 'fa-globe'} text-xs ${selectedRepoUrl === repo.url ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}></i>
                        <span className={`text-sm truncate ${selectedRepoUrl === repo.url ? 'text-blue-700 dark:text-blue-100 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}>{repo.name}</span>
                      </div>
                      {selectedRepoUrl === repo.url && <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>}
                    </button>
                   ))
                ) : (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-600 text-sm">
                    Repositorios no encontrados
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#1c1c1f] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!spaceName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSpaceModal;