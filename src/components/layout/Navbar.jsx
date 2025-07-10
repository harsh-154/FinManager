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
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed w-full z-50 top-0 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            FinSplit 🪙
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-all duration-200 hover:text-indigo-500 dark:hover:text-indigo-300 ${
                    isActive
                      ? 'text-indigo-700 dark:text-indigo-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-indigo-500 dark:after:bg-indigo-300'
                      : 'text-gray-600 dark:text-gray-300'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Dark mode button */}
            <button onClick={toggleDarkMode} title="Toggle dark mode">
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>

          {/* User info + Logout */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser && (
              <>
                <div className="bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white rounded-full px-3 py-1 text-sm font-semibold">
                  {getInitials(currentUser.displayName || currentUser.email)}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 dark:text-gray-300">
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
            className="md:hidden bg-white dark:bg-gray-900 px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
          >
            {navItems.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-sm font-medium ${
                    isActive
                      ? 'text-indigo-700 dark:text-indigo-300 underline'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-300'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button onClick={toggleDarkMode} className="text-sm">
              {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="text-sm text-red-500"
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
