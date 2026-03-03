"use client";


import React, { useState } from 'react';

interface CreateSpaceModalProps {
  onClose: () => void;
  onCreate: (spaceName: string, repoUrl: string, defaultBranch: string) => void;
}

const USER_REPOS = [
  { id: 100, name: 'seiroo/vortex', url: 'https://github.com/seiroo/vortex', isPrivate: false, language: 'TypeScript' },
  { id: 101, name: 'seiroo/vortex-api', url: 'https://github.com/seiroo/vortex-api', isPrivate: true, language: 'TypeScript' },
  { id: 102, name: 'seiroo/landing-page-v2', url: 'https://github.com/seiroo/landing-page-v2', isPrivate: false, language: 'Vue' },
  { id: 103, name: 'seiroo/react-kanban', url: 'https://github.com/seiroo/react-kanban', isPrivate: false, language: 'React' },
  { id: 104, name: 'seiroo/finance-dashboard', url: 'https://github.com/seiroo/finance-dashboard', isPrivate: true, language: 'Python' },
  { id: 105, name: 'seiroo/mobile-client', url: 'https://github.com/seiroo/mobile-client', isPrivate: true, language: 'Swift' },
];

const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({ onClose, onCreate }) => {
  const [spaceName, setSpaceName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<typeof USER_REPOS[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleCreateSpace = () => {
    if (spaceName.trim() && selectedRepo) {

        onCreate(spaceName.trim(), selectedRepo.url, 'main');
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
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-space-title"
    >
      <div
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-lg flex flex-col animate-scale-in shadow-2xl max-h-[90vh]"
        onClick={handleModalContentClick}
      >
        <header className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div>
            <h1 id="create-space-title" className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Create new space</h1>
            <p className="text-xs text-neutral-500 mt-1">Setup a folder and link a repository</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </header>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Space / Folder Name Input */}
          <div>
            <label htmlFor="space-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <i className="fa-regular fa-folder mr-2 text-neutral-500"></i>
              Folder Name
            </label>
            <input
              type="text"
              id="space-name"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="e.g., Project Alpha"
              className="w-full bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2.5 text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              autoFocus
            />
          </div>

          {/* Visual Tree Preview */}
          <div className="bg-gray-50 dark:bg-[#111113] rounded-lg border border-dashed border-neutral-300 dark:border-neutral-800 p-4 select-none">
            <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Structure Preview</h3>
            <div className="flex flex-col ml-1">
                {/* Parent Folder */}
                <div className="flex items-center gap-2 py-1">
                    <i className={`fa-regular ${spaceName.length > 0 ? 'fa-folder-open' : 'fa-folder'} text-neutral-400 transition-all`}></i>
                    <span className={`text-sm font-medium ${spaceName ? 'text-neutral-900 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-600'}`}>
                        {spaceName || 'Untitled Folder'}
                    </span>
                </div>
                
                {/* Child Item (Repository) */}
                <div className="flex relative pl-5 pt-0.5">
                    {/* Tree Lines */}
                    <div className="absolute left-[7px] -top-2 bottom-1/2 w-px bg-neutral-300 dark:bg-neutral-700"></div>
                    <div className="absolute left-[7px] top-1/2 w-3 h-px bg-neutral-300 dark:bg-neutral-700"></div>
                    
                    {/* Content */}
                    <div className="flex items-center gap-2 py-1">
                        <i className={`fa-brands fa-github text-xs ${selectedRepo ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-700'}`}></i>
                        {selectedRepo ? (
                            <div className="flex flex-col">
                                <span className="text-neutral-700 dark:text-neutral-300 text-sm animate-fade-in">{selectedRepo.name}</span>
                            </div>
                        ) : (
                            <span className="text-neutral-500 dark:text-neutral-600 text-sm italic">select a repository...</span>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* Repository Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <i className="fa-brands fa-github mr-2 text-neutral-500"></i>
              Link Repository <span className="text-red-400/80 ml-1 text-xs font-normal">(Required)</span>
            </label>
            
            <div className="bg-gray-50 dark:bg-[#0e0e10] border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden flex flex-col h-40">
              {/* Search Bar */}
              <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-gray-50 dark:bg-[#0e0e10] z-10">
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
                  <input 
                    type="text"
                    placeholder="Filter repositories..."
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
                        <div className="flex flex-col truncate">
                            <span className={`text-sm truncate ${selectedRepo?.id === repo.id ? 'text-blue-700 dark:text-blue-100 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}>{repo.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] text-neutral-500 border border-neutral-200 dark:border-neutral-800 px-1.5 rounded">{repo.language}</span>
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#1c1c1f] rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSpace}
            disabled={!spaceName.trim() || !selectedRepo}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              spaceName.trim() && selectedRepo
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-plus"></i>
            Create Space
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceModal;

