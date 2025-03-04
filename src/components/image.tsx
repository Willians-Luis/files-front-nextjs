import url from '@/app/api/url';
import React from 'react'


interface ImageDisplayProps {
  filename: string;
  alt: string;
  size?: "small" | "large";
}

export const Image: React.FC<ImageDisplayProps> = ({ filename, alt, size = "small" }) => {
  return (
    <div className={`flex items-center justify-center ${size === "large" ? "h-[calc(100vh-100px)] w-screen" : ""}`}>
      <img
        src={`${url}/file/stream/${filename}`}
        alt={alt}
        className={`m-auto ${size === "large" ? "max-h-full max-w-full object-contain" : "w-14"} bg-black rounded shadow-lg`}
      />
    </div>
  )
}

