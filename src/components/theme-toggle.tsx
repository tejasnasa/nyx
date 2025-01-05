"use client";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      setDarkTheme(false);
    } else {
      setDarkTheme(true);
    }
  }, []);

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkTheme]);

  return (
    <div>
      <button
        onClick={() => setDarkTheme(!darkTheme)}
        className="dark:bg-white dark:text-black bg-black text-white"
      >
        Toggle Theme
      </button>
    </div>
  );
};

export default ThemeToggle;
