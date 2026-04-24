import React, { useEffect, useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  sizeClass?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, sizeClass = "w-6 h-6", className = "" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-full border-2 border-white dark:border-[#28282b] bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center ${className}`}
        aria-label={alt}
        title={alt}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-[72%] h-[72%]" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
          <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      draggable={false}
      className={`${sizeClass} rounded-full border-2 border-white dark:border-[#28282b] object-cover ${className}`}
    />
  );
};

export default Avatar;
