import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
}

export const DEFAULT_AVATAR_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="20" fill="#2E3035"/>
      <g transform="translate(8 8)" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/>
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
      </g>
    </svg>
  `);

export const handleAvatarError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === "true") return;

  image.dataset.fallbackApplied = "true";
  image.src = DEFAULT_AVATAR_SRC;
};

const Avatar: React.FC<AvatarProps> = ({ src, alt }) => {
  return (
    <img
      src={src?.trim() || DEFAULT_AVATAR_SRC}
      alt={alt}
      onError={handleAvatarError}
      className="w-6 h-6 rounded-full border-2 border-white dark:border-[#28282b] object-cover"
    />
  );
};

export default Avatar;

//-supabase:- vortex-db  pssw:  vortexkamban26
// Project ID: vrxxjnnrsydyiyopiqpy

