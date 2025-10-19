import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Apply theme to body element and save to localStorage
  useEffect(() => {
    console.log(`🎨 Applying theme: ${theme}`);
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    
    // Log current CSS variables for debugging
    const computedStyle = getComputedStyle(document.body);
    console.log('Current theme colors:', {
      bgPrimary: computedStyle.getPropertyValue('--light-bg-primary'),
      bgSecondary: computedStyle.getPropertyValue('--light-bg-secondary'),
      textPrimary: computedStyle.getPropertyValue('--light-text-primary'),
      accent: computedStyle.getPropertyValue('--light-accent')
    });
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`🔄 Theme toggle: ${theme} → ${newTheme}`);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
