import { useEffect } from 'react';

const STORAGE_KEY = 'focus_tube_dark_mode';

export function useDarkMode() {
  useEffect(() => {
    const enabled = localStorage.getItem(STORAGE_KEY) === 'true';
    document.documentElement.classList.toggle('dark', enabled);
  }, []);
}

export function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(STORAGE_KEY, String(isDark));
}

export function isDarkModeEnabled() {
  return document.documentElement.classList.contains('dark');
}
