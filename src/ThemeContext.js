// ThemeContext.js
import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem("theme");

  // Determine system preference
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  // Use saved theme if available, otherwise use system preference
  const defaultTheme = savedTheme || systemPreference;

  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    // Apply the theme class to the html element
    document.documentElement.className = `theme-${theme}`;
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};