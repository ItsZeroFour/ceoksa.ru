import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = getSystemTheme();
    
    if (savedTheme) {
      setThemeState(savedTheme);
      setIsSystemTheme(false);
    } else {
      setThemeState(systemTheme);
      setIsSystemTheme(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (!isSystemTheme) {
      localStorage.setItem('theme', theme);
    } else {
      localStorage.removeItem('theme');
    }
  }, [theme, isSystemTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isSystemTheme) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setThemeState(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isSystemTheme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    setIsSystemTheme(false);
  };

  const resetToSystemTheme = () => {
    setIsSystemTheme(true);
    setThemeState(getSystemTheme());
  };

  return {
    theme,
    isSystemTheme,
    isDarkMode: theme === 'dark',
    isLightMode: theme === 'light',
    toggleTheme,
    resetToSystemTheme
  };
}