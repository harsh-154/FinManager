// src/contexts/DarkModeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }) => {
  // Initialize dark mode based on user preference or local storage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false; // Default to light mode
  });

  // Effect to apply/remove 'dark' class to the documentElement
  // and save the preference to local storage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', JSON.stringify(true));
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', JSON.stringify(false));
    }
  }, [darkMode]);

  // The value provided by the context
  const value = {
    darkMode,
    setDarkMode, // Expose setDarkMode so components can directly change it
    toggleDarkMode: () => setDarkMode(prevMode => !prevMode), // A utility toggle function
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};