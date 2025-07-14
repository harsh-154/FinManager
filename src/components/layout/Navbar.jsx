// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext'; // ✅ NEW



const toggleDarkMode = () => setDarkMode(!darkMode);

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/personal-finance', label: 'Finance' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed w-full z-50 top-0 shadow-lg"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg p-1"
            aria-label="Go to dashboard"
          >
            <span className="bg-indigo-100 dark:bg-indigo-700 rounded-full px-2 py-1 text-indigo-700 dark:text-white text-lg shadow-sm">🪙</span>
            <span>FinSplit</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative text-base font-semibold transition-all duration-200 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isActive
                      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-800 shadow after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-indigo-500 dark:after:bg-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800'
                  }`
                }
                aria-label={label}
              >
                {label}
              </NavLink>
            ))}

            {/* Dark mode button */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
              className="ml-2 p-2 rounded-full border border-transparent hover:border-indigo-400 dark:hover:border-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
            </button>
          </div>

          {/* User info + Logout */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser && (
              <>
                <div
                  className="w-9 h-9 flex items-center justify-center bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white rounded-full text-base font-bold shadow-sm border-2 border-indigo-200 dark:border-indigo-600"
                  title={currentUser.displayName || currentUser.email}
                  aria-label="User initials"
                >
                  {getInitials(currentUser.displayName || currentUser.email)}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 dark:text-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4 rounded-b-2xl shadow-xl mt-1"
            style={{ overflow: 'hidden' }}
            aria-label="Mobile navigation menu"
          >
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-base font-semibold px-3 py-2 rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isActive
                      ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-800 underline shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800'
                  }`
                }
                aria-label={label}
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={toggleDarkMode}
              className="text-base flex items-center gap-2 px-3 py-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Toggle dark mode"
            >
              <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
              <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="text-base text-red-500 px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Logout"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
