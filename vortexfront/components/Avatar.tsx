import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="w-6 h-6 rounded-full border-2 border-white dark:border-[#28282b] object-cover"
    />
  );
};

export default Avatar;

//-supabase:- vortex-db  pssw:  vortexkamban26
// Project ID: vrxxjnnrsydyiyopiqpy

