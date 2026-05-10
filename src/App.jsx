import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getSlots } from './api/client';
import SlotDisplay from './components/SlotDisplay';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';

// --- NEW: Floating Theme Toggle Component ---
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button 
    onClick={toggleTheme}
    className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-[#6b1236] text-white hover:bg-[#4a0c25] dark:bg-[#eeb211] dark:text-[#6b1236] dark:hover:bg-[#d49d0e] transition-all z-50 focus:outline-none"
    aria-label="Toggle Dark Mode"
  >
    {theme === 'light' ? (
      // Moon Icon
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
    ) : (
      // Sun Icon
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    )}
  </button>
);

function RegistrationPage() {
  const [slots, setSlots] = useState({ hackathon: 0, startup: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialSlots = async () => {
      try {
        const data = await getSlots();
        setSlots(data);
      } catch (error) {
        console.error("Failed to load slots on startup.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialSlots();
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 sm:py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="bg-[#6b1236] py-6 px-6 sm:py-8 sm:px-8 border-b-4 border-[#eeb211]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight">Hack & Hustle</h2>
          <p className="text-[#eeb211] text-center mt-2 font-medium tracking-wide uppercase text-xs sm:text-sm">Official Registration Portal</p>
        </div>
        <div className="p-6 sm:p-8">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <p className="text-[#6b1236] dark:text-[#eeb211] font-medium animate-pulse">Loading availability...</p>
            </div>
          ) : (
            <>
              <SlotDisplay slots={slots} />
              <div className="h-px bg-gray-200 dark:bg-gray-700 w-full my-6 sm:my-8 transition-colors"></div>
              <RegistrationForm slots={slots} onRegistrationSuccess={(updatedSlots) => setSlots(updatedSlots)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  // Theme State Management
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<RegistrationPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;