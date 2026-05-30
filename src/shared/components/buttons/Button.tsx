import React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ isLoading, icon, children, ...props }) => {
  return (
    <button
      {...props}
      className={`w-full bg-[#3D5665] hover:bg-[#16333F] text-white rounded-xl py-3 flex justify-center items-center gap-2.5 font-medium text-sm transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <span className="text-xs opacity-80">Procesando...</span>
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
};