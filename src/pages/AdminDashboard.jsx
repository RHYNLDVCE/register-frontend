import React, { useState, useEffect } from 'react';
import { getSlots, getParticipants, loginAdmin, saveTemplate, getTemplate, dispatchEmail } from '../api/client';

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [slots, setSlots] = useState({ hackathon: 0, startup: 0 });
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // New State for Tabs and Email Management
  const [activeTab, setActiveTab] = useState('participants'); // 'participants' or 'emails'
  const [emailMode, setEmailMode] = useState('auto'); // 'auto' or 'blast'
  
  // Auto-Responder State
  const [emailForm, setEmailForm] = useState({ track: 'hackathon', subject: '', body: '', delay_minutes: 5 });
  const [saveMessage, setSaveMessage] = useState('');

  // Blast (Manual/Scheduled) State
  const [blastForm, setBlastForm] = useState({ target_type: 'all', specific_emails: [], subject: '', body: '', send_at: '' });
  const [blastStatus, setBlastStatus] = useState({ loading: false, message: '', error: false });

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

  // Load email template when switching to the emails tab / auto mode
  useEffect(() => {
    if (token && activeTab === 'emails' && emailMode === 'auto') {
      loadTemplate(emailForm.track);
    }
  }, [activeTab, emailMode, token]);

  const loadTemplate = async (track) => {
    try {
      const data = await getTemplate(token, track);
      setEmailForm(data);
    } catch (error) {
      console.error("Error loading template", error);
    }
  };

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

  // --- Auto Responder Handlers ---
  const handleTrackChange = (e) => {
    const newTrack = e.target.value;
    setEmailForm({ ...emailForm, track: newTrack });
    loadTemplate(newTrack);
    setSaveMessage('');
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSaveMessage('Saving...');
    try {
      await saveTemplate(token, emailForm);
      setSaveMessage('Template successfully saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving template.');
    }
  };

  // --- Blast Email Handlers ---
  const handleBlastEmail = async (e) => {
    e.preventDefault();
    
    if (blastForm.target_type === 'specific' && blastForm.specific_emails.length === 0) {
      return setBlastStatus({ loading: false, message: "Please select at least one participant.", error: true });
    }

    setBlastStatus({ loading: true, message: 'Processing request...', error: false });
    
    try {
      // Format datetime to ISO string if provided, otherwise null for immediate sending
      const payload = { 
        ...blastForm, 
        send_at: blastForm.send_at ? new Date(blastForm.send_at).toISOString() : null 
      };
      
      const response = await dispatchEmail(token, payload);
      setBlastStatus({ loading: false, message: response.message, error: false });
      
      // Reset form on success
      setBlastForm({ target_type: 'all', specific_emails: [], subject: '', body: '', send_at: '' });
      setTimeout(() => setBlastStatus({ message: '' }), 5000);
    } catch (error) {
      setBlastStatus({ loading: false, message: error.message || "Failed to dispatch email", error: true });
    }
  };

  const handleToggleSpecificEmail = (email) => {
    setBlastForm(prev => {
      const emails = prev.specific_emails;
      if (emails.includes(email)) return { ...prev, specific_emails: emails.filter(e => e !== email) };
      return { ...prev, specific_emails: [...emails, email] };
    });
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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
          <button
            className={`py-2 px-4 font-bold whitespace-nowrap transition-colors ${activeTab === 'participants' ? 'text-[#6b1236] dark:text-[#eeb211] border-b-2 border-[#6b1236] dark:border-[#eeb211]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            onClick={() => setActiveTab('participants')}
          >
            Registrations
          </button>
          <button
            className={`py-2 px-4 font-bold whitespace-nowrap transition-colors ${activeTab === 'emails' ? 'text-[#6b1236] dark:text-[#eeb211] border-b-2 border-[#6b1236] dark:border-[#eeb211]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            onClick={() => setActiveTab('emails')}
          >
            Email Management
          </button>
        </div>
        
        {/* Tab Content: Participants */}
        {activeTab === 'participants' && (
          <>
            {/* Stats Cards */}
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

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-187.5">
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
          </>
        )}

        {/* Tab Content: Email Management */}
        {activeTab === 'emails' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-t-4 border-[#6b1236] dark:border-[#eeb211] overflow-hidden">
            
            {/* Email Mode Toggle */}
            <div className="flex flex-col sm:flex-row bg-gray-100 dark:bg-gray-700">
              <button 
                className={`flex-1 py-3 px-4 font-bold transition-colors ${emailMode === 'auto' ? 'bg-[#6b1236] text-white dark:bg-[#eeb211] dark:text-[#6b1236]' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`} 
                onClick={() => setEmailMode('auto')}
              >
                Post-Registration Auto-Responder
              </button>
              <button 
                className={`flex-1 py-3 px-4 font-bold transition-colors ${emailMode === 'blast' ? 'bg-[#6b1236] text-white dark:bg-[#eeb211] dark:text-[#6b1236]' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`} 
                onClick={() => setEmailMode('blast')}
              >
                Manual / Scheduled Blast
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {emailMode === 'auto' ? (
                // --- Auto-Responder Form ---
                <form onSubmit={handleSaveTemplate} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Track Settings</label>
                      <select 
                        value={emailForm.track} 
                        onChange={handleTrackChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white"
                      >
                        <option value="hackathon">Hackathon</option>
                        <option value="startup">Startup</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Send Delay (Minutes)</label>
                      <input 
                        type="number" 
                        value={emailForm.delay_minutes} 
                        onChange={(e) => setEmailForm({...emailForm, delay_minutes: parseInt(e.target.value) || 0})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Email Subject</label>
                    <input 
                      type="text" 
                      value={emailForm.subject} 
                      onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white"
                      placeholder="e.g., Registration Confirmed: Hack & Hustle"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                      HTML Body (Use <span className="text-[#6b1236] dark:text-[#eeb211] bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{'}{'{'}firstName{'}'}{'}'}</span> and <span className="text-[#6b1236] dark:text-[#eeb211] bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{'}{'{'}username{'}'}{'}'}</span>)
                    </label>
                    <textarea 
                      rows="8"
                      value={emailForm.body} 
                      onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="<h1>Hello {{firstName}}!</h1>&#10;<p>Welcome to the event.</p>"
                      required
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-4">
                    <button type="submit" className="bg-[#6b1236] dark:bg-[#eeb211] dark:text-[#6b1236] hover:bg-[#4a0c25] dark:hover:bg-[#d49d0e] text-white font-bold py-3 px-6 rounded shadow transition-colors">
                      Save Configuration
                    </button>
                    {saveMessage && (
                      <span className={`text-sm font-bold ${saveMessage.includes('Error') ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {saveMessage}
                      </span>
                    )}
                  </div>
                </form>
              ) : (
                // --- Manual / Scheduled Blast Form ---
                <form onSubmit={handleBlastEmail} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Target Audience</label>
                      <select 
                        value={blastForm.target_type} 
                        onChange={(e) => setBlastForm({...blastForm, target_type: e.target.value, specific_emails: []})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white"
                      >
                        <option value="all">All Registered Participants</option>
                        <option value="hackathon">Hackathon Track Only</option>
                        <option value="startup">Startup Track Only</option>
                        <option value="specific">Specific Users...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                        Schedule (Optional)
                      </label>
                      <input 
                        type="datetime-local" 
                        value={blastForm.send_at} 
                        onChange={(e) => setBlastForm({...blastForm, send_at: e.target.value})}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white"
                      />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Leave empty to send immediately.</p>
                    </div>
                  </div>

                  {/* Render Specific User Checkboxes if selected */}
                  {blastForm.target_type === 'specific' && (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-3">Select Participants:</p>
                      {participants.length === 0 ? (
                        <p className="text-sm text-gray-500">No participants found.</p>
                      ) : (
                        participants.map(p => (
                          <label key={p.email} className="flex items-center gap-3 mb-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={blastForm.specific_emails.includes(p.email)}
                              onChange={() => handleToggleSpecificEmail(p.email)}
                              className="w-4 h-4 text-[#6b1236] dark:text-[#eeb211] border-gray-300 dark:border-gray-500 rounded focus:ring-[#6b1236] dark:focus:ring-[#eeb211] dark:bg-gray-600"
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {p.firstName} {p.lastName} <span className="text-xs text-gray-500 dark:text-gray-400">({p.track})</span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Email Subject</label>
                    <input 
                      type="text" 
                      required
                      value={blastForm.subject} 
                      onChange={(e) => setBlastForm({...blastForm, subject: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white"
                      placeholder="e.g., Important Update for Hack & Hustle"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Email HTML Body</label>
                    <textarea 
                      rows="6" required
                      value={blastForm.body} 
                      onChange={(e) => setBlastForm({...blastForm, body: e.target.value})}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] outline-none text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="<h1>Hello!</h1>&#10;<p>Please note the schedule change...</p>"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button 
                      type="submit" 
                      disabled={blastStatus.loading} 
                      className="bg-[#6b1236] dark:bg-[#eeb211] dark:text-[#6b1236] hover:bg-[#4a0c25] dark:hover:bg-[#d49d0e] text-white font-bold py-3 px-6 rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {blastStatus.loading ? 'Processing...' : blastForm.send_at ? 'Schedule Blast' : 'Send Immediately'}
                    </button>
                    {blastStatus.message && (
                      <span className={`text-sm font-bold ${blastStatus.error ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {blastStatus.message}
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;