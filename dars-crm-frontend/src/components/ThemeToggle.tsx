"use client";

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export default function ThemeToggle({ className = "", showText = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer select-none ${
        theme === 'dark'
          ? 'bg-neutral-900 border-neutral-700 text-amber-400 hover:bg-neutral-800'
          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
      } ${className}`}
      title={theme === 'dark' ? "Switch to White Light Theme" : "Switch to Pure Black Dark Theme"}
      aria-label="Toggle Theme Mode"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-amber-400 fill-amber-400 animate-spin-slow" />
          {showText && <span>Light Theme</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-800 fill-slate-800" />
          {showText && <span>Dark Theme</span>}
        </>
      )}
    </button>
  );
}
