import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
}

export const Input: React.FC<InputProps> = ({ icon, label, ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-[#16333F] mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#16333F] focus:ring-1 focus:ring-[#16333F] shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] transition-all`}
        />
      </div>
    </div>
  );
};