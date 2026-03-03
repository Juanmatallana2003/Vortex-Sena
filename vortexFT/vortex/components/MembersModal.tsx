"use client";


import React, { useState } from 'react';
import { Space } from '../types';

interface MembersModalProps {
  space: Space;
  onClose: () => void;
}

interface Member {
    name: string;
    username: string; // Git username
    email: string;
    avatar: string;
}

const MembersModal: React.FC<MembersModalProps> = ({ space, onClose }) => {
  // Initial mock data with extended fields
  const [members, setMembers] = useState<Member[]>([
    { name: 'Alex Johnson', username: 'alexj_dev', email: 'alex.j@vortex.com', avatar: 'https://i.pravatar.cc/40?u=a' },
    { name: 'Maria Garcia', username: 'mgarcia_code', email: 'maria.g@vortex.com', avatar: 'https://i.pravatar.cc/40?u=b' },
    { name: 'James Smith', username: 'jsmith88', email: 'james.smith@gmail.com', avatar: 'https://i.pravatar.cc/40?u=c' },
    { name: 'Patricia Williams', username: 'patty_w', email: 'patricia.w@outlook.com', avatar: 'https://i.pravatar.cc/40?u=d' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRemoveMember = (emailToRemove: string) => {
    setMembers(members.filter((m) => m.email !== emailToRemove));
  };

  // Filter logic
  const filteredMembers = members.filter(member => {
    const query = searchTerm.toLowerCase();
    return (
        member.name.toLowerCase().includes(query) ||
        member.username.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="members-title"
    >
      <div
        className="bg-white dark:bg-[#1c1c1f] border border-neutral-200 dark:border-neutral-800 rounded-lg w-full max-w-md flex flex-col animate-scale-in shadow-2xl h-[500px]" 
        onClick={handleModalContentClick}
      >
        <header className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div>
            <h1 id="members-title" className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Manage Members
            </h1>
            <p className="text-xs text-neutral-500">
               Space: <span className="font-semibold text-neutral-700 dark:text-neutral-400">{space.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </header>

        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search Section */}
            <div className="p-4 pb-2">
                <div className="relative">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, @username or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#111113] border border-neutral-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                        autoFocus
                    />
                </div>
            </div>
            
            {/* Members List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="flex items-center justify-between mb-3 mt-2">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        Members ({filteredMembers.length})
                    </span>
                </div>
                
                {filteredMembers.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                        {filteredMembers.map((member) => (
                        <li key={member.email} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/50 group transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200 truncate">{member.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 truncate">
                                        <span className="font-mono text-blue-600 dark:text-blue-400/80">@{member.username}</span>
                                        <span>•</span>
                                        <span className="truncate">{member.email}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveMember(member.email)}
                                className="text-neutral-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded flex-shrink-0"
                                title="Remove member"
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-neutral-500 dark:text-neutral-600 space-y-2">
                        <i className="fa-solid fa-user-slash text-2xl mb-2 opacity-50"></i>
                        <span className="text-sm italic">No members found matching &quot;{searchTerm}&quot;</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;


