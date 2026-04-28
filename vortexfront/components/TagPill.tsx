import React from 'react';
import { Tag } from '../types';

interface TagPillProps {
  tag: Tag;
}

const TagPill: React.FC<TagPillProps> = ({ tag }) => {
  const colorClasses: { [key: string]: string } = {
    gray: 'bg-gray-100 dark:bg-neutral-700/60 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300',
    blue: 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700/60 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700/60 text-green-700 dark:text-green-300',
    purple: 'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700/60 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-50 dark:bg-orange-900/40 border-orange-200 dark:border-orange-700/60 text-orange-700 dark:text-orange-300',
    red: 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700/60 text-red-700 dark:text-red-300',
    pink: 'bg-pink-50 dark:bg-pink-900/40 border-pink-200 dark:border-pink-700/60 text-pink-700 dark:text-pink-300',
  };

  const baseClass = "flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border";
  const tagClass = colorClasses[tag.color] || colorClasses['gray'];

  return (
    <div className={`${baseClass} ${tagClass}`}>
      {tag.icon && (
        <i className={`${tag.icon} ${tag.iconColor || 'text-neutral-500 dark:text-neutral-400'}`}></i>
      )}
      <span>{tag.label}</span>
    </div>
  );
};

export default TagPill;