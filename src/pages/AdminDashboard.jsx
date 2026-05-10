import React, { useState, useEffect } from 'react';
import { getSlots, getParticipants, loginAdmin } from '../api/client';

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [slots, setSlots] = useState({ hackathon: 0, startup: 0 });
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [slotsData, participantsData] = await Promise.all([getSlots(), getParticipants(token)]);
        setSlots(slotsData);
        setParticipants(participantsData);
      } catch (error) {
        if (error.message === "Unauthorized") handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await loginAdmin(loginForm.username, loginForm.password);
      localStorage.setItem('adminToken', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setParticipants([]);
  };

  const handleExportCSV = () => {
    if (participants.length === 0) return alert("No data to export.");
    const headers = ["Track", "First Name", "Last Name", "Email", "Course", "Year Level", "Username (Hackathon)"];
    const csvRows = participants.map(p => [p.track, p.firstName, p.lastName, p.email, p.course, p.yearLevel, p.username || "N/A"]);
    const csvContent = [headers.join(","), ...csvRows.map(row => row.map(item => `"${item}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "MSU_Seminar_Registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm border-t-4 border-[#6b1236] dark:border-[#eeb211]">
          <h2 className="text-2xl font-bold text-[#6b1236] dark:text-[#eeb211] text-center mb-6">Admin Login</h2>
          {loginError && <p className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 mb-4 rounded text-center font-bold">{loginError}</p>}
          <input 
            type="text" placeholder="Username" required
            className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded mb-4 focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none"
            value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded mb-6 focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none"
            value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
          />
          <button type="submit" className="w-full bg-[#6b1236] dark:bg-[#eeb211] dark:text-[#6b1236] text-white font-bold py-3 rounded hover:bg-[#4a0c25] dark:hover:bg-[#d49d0e] transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  // --- DASHBOARD ---
  if (isLoading) return <div className="text-center mt-20 font-bold text-[#6b1236] dark:text-[#eeb211]">Loading Secure Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6b1236] dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Secure Management Portal</p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <button onClick={handleExportCSV} className="flex-1 sm:flex-none bg-[#eeb211] hover:bg-[#d49d0e] text-[#6b1236] font-bold py-2 px-4 rounded shadow transition-colors text-sm sm:text-base">
              Export CSV
            </button>
            <button onClick={handleLogout} className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-gray-800 font-bold py-2 px-4 rounded shadow transition-colors text-sm sm:text-base">
              Logout
            </button>
          </div>
        </div>
        
        {/* Responsive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-t-4 border-[#6b1236] dark:border-gray-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Total Registered</p>
            <p className="text-3xl font-extrabold text-[#6b1236] dark:text-white">{participants.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-t-4 border-blue-500 dark:border-blue-400">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Hackathon Taken</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{15 - slots.hackathon} / 15</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-t-4 border-green-500 dark:border-green-400">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase">Startup Taken</p>
            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{15 - slots.startup} / 15</p>
          </div>
        </div>

        {/* Responsive Table: overflow-x-auto allows swiping on mobile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-150]">
            <thead>
              <tr className="bg-[#6b1236] dark:bg-gray-700 text-white uppercase text-xs tracking-wider">
                <th className="p-3 sm:p-4 border-b dark:border-gray-600">Name</th>
                <th className="p-3 sm:p-4 border-b dark:border-gray-600">Email</th>
                <th className="p-3 sm:p-4 border-b dark:border-gray-600">Track</th>
                <th className="p-3 sm:p-4 border-b dark:border-gray-600">Program</th>
                <th className="p-3 sm:p-4 border-b dark:border-gray-600">Username</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {participants.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">No registrations yet.</td></tr>
              ) : (
                participants.map((p, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors">
                    <td className="p-3 sm:p-4 font-bold text-gray-800 dark:text-gray-200">{p.firstName} {p.lastName}</td>
                    <td className="p-3 sm:p-4 text-gray-600 dark:text-gray-400">{p.email}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.track === 'hackathon' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                        {p.track}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 dark:text-gray-400">{p.course} ({p.yearLevel} Yr)</td>
                    <td className="p-3 sm:p-4 text-gray-500 dark:text-gray-400">{p.username || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;