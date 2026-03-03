"use client";


import React, { useState } from 'react';
import { Space } from '../types';

interface EditSpaceModalProps {
  space: Space;
  onClose: () => void;
  onSave: (updatedSpace: Space) => void;
}

// Mock data for user repositories (Same as CreateSpaceModal)
const USER_REPOS = [
  { id: 100, name: 'seiroo/vortex', url: 'https://github.com/seiroo/vortex', isPrivate: false, language: 'TypeScript' },
  { id: 101, name: 'seiroo/vortex-api', url: 'https://github.com/seiroo/vortex-api', isPrivate: true, language: 'TypeScript' },
  { id: 102, name: 'seiroo/landing-page-v2', url: 'https://github.com/seiroo/landing-page-v2', isPrivate: false, language: 'Vue' },
  { id: 103, name: 'seiroo/react-kanban', url: 'https://github.com/seiroo/react-kanban', isPrivate: false, language: 'React' },
  { id: 104, name: 'seiroo/finance-dashboard', url: 'https://github.com/seiroo/finance-dashboard', isPrivate: true, language: 'Python' },
  { id: 105, name: 'seiroo/mobile-client', url: 'https://github.com/seiroo/mobile-client', isPrivate: true, language: 'Swift' },
];

const EditSpaceModal: React.FC<EditSpaceModalProps> = ({ space, onClose, onSave }) => {
  const [spaceName, setSpaceName] = useState(space.name);
  const [selectedRepo, setSelectedRepo] = useState<typeof USER_REPOS[0] | null>(
    () => USER_REPOS.find((repo) => repo.url === space.repoUrl) ?? null
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    if (spaceName.trim()) {
      onSave({ 
        ...space, 
        name: spaceName.trim(), 
        repoUrl: selectedRepo ? selectedRepo.url : undefined 
      });
      onClose();
    }
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const filteredRepos = USER_REPOS.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-space-title"
    >
      <div
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-lg w-full max-w-lg flex flex-col animate-scale-in shadow-xl"
        onClick={handleModalContentClick}
      >
        <header className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 id="edit-space-title" className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Edit space</h1>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="Close"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </header>
        <div className="p-6 space-y-6">
          
          {/* Space Name Input */}
          <div>
            <label htmlFor="space-name-edit" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <i className="fa-regular fa-folder mr-2 text-neutral-500"></i>
                Space name
            </label>
            <input
              type="text"
              id="space-name-edit"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="e.g., my-awesome-project"
              className="w-full bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Repository Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <i className="fa-brands fa-github mr-2 text-neutral-500"></i>
              Linked Repository
            </label>
            
            <div className="bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden flex flex-col h-48">
              {/* Search Bar */}
              <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-gray-50 dark:bg-[#0e0e10] z-10">
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

              {/* Repo List */}
              <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md border transition-all ${
                        selectedRepo?.id === repo.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30' 
                          : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <i className={`fa-solid ${repo.isPrivate ? 'fa-lock' : 'fa-book-bookmark'} text-xs ${selectedRepo?.id === repo.id ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}></i>
                        <span className={`text-sm truncate ${selectedRepo?.id === repo.id ? 'text-blue-700 dark:text-blue-100 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}>{repo.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         {selectedRepo?.id === repo.id && <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-600 text-sm">
                    No repositories found
                  </div>
                )}
              </div>
            </div>
            {selectedRepo && (
                <div className="mt-2 flex justify-end">
                    <button 
                        onClick={() => setSelectedRepo(null)} 
                        className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                    >
                        Unlink repository
                    </button>
                </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-[#27272a] border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!spaceName.trim()}
              className="px-4 py-2 bg-blue-600 border border-blue-500 rounded-md hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSpaceModal;


