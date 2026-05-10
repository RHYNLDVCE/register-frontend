import React, { useState } from 'react';
import { registerParticipant } from '../api/client';
import { Link } from 'react-router-dom';

const PROGRAMS = ["BSIT-Networking", "BSIT-Database", "BSCA-IOT", "BSCA-Embedded System"];
const YEAR_LEVELS = ["1st", "2nd", "3rd", "4th"];

const RegistrationForm = ({ slots, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    track: '', lastName: '', firstName: '', username: '', course: '', yearLevel: '', email: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Processing registration...' });

    try {
      const result = await registerParticipant(formData);
      setStatus({ type: 'success', message: 'Registration Successful!' });
      setFormData({ track: '', lastName: '', firstName: '', username: '', course: '', yearLevel: '', email: '' });
      onRegistrationSuccess(result.slots);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] focus:border-transparent transition-colors outline-none cursor-pointer text-gray-900 dark:text-white";
  const textInputClass = "w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-[#6b1236] dark:focus:ring-[#eeb211] focus:border-transparent transition-colors outline-none text-gray-900 dark:text-white";
  const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className={labelClass}>Select Track</label>
        <select name="track" className={inputClass} value={formData.track} onChange={handleChange} required>
          <option value="">-- Choose an option --</option>
          <option value="hackathon" disabled={slots.hackathon <= 0}>Hackathon {slots.hackathon <= 0 && '(FULL)'}</option>
          <option value="startup" disabled={slots.startup <= 0}>Startup {slots.startup <= 0 && '(FULL)'}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name</label>
          <input name="firstName" type="text" className={textInputClass} required value={formData.firstName} onChange={handleChange} />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input name="lastName" type="text" className={textInputClass} required value={formData.lastName} onChange={handleChange} />
        </div>
      </div>

      {formData.track === 'hackathon' && (
        <div className="bg-[#fff8f1] dark:bg-[#3d2616] p-4 sm:p-5 rounded-md border border-[#fbe0c3] dark:border-[#7a4e25] transition-all">
          <label className="block text-xs font-bold text-[#8a5a2b] dark:text-[#eeb211] uppercase tracking-wide mb-2">Hackathon Username</label>
          <input name="username" type="text" className="w-full p-3 bg-white dark:bg-gray-800 border border-[#fbe0c3] dark:border-[#7a4e25] text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-[#eeb211] outline-none" required value={formData.username} onChange={handleChange} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Course / Program</label>
          <select name="course" className={inputClass} required value={formData.course} onChange={handleChange}>
            <option value="">-- Select Program --</option>
            {PROGRAMS.map((prog) => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className={labelClass}>Year Level</label>
          <select name="yearLevel" className={inputClass} required value={formData.yearLevel} onChange={handleChange}>
            <option value="">-- Select Year --</option>
            {YEAR_LEVELS.map((year) => (
              <option key={year} value={year}>{year} Year</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Email Address</label>
        <input name="email" type="email" className={textInputClass} required value={formData.email} onChange={handleChange} />
      </div>

      {/* ---Data Privacy Checkbox --- */}
      <div className="mt-4 pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex items-center h-5 mt-0.5">
            <input 
              type="checkbox" 
              required 
              className="w-4 h-4 text-[#6b1236] dark:text-[#eeb211] border-gray-300 dark:border-gray-600 rounded focus:ring-[#6b1236] dark:focus:ring-[#eeb211] dark:bg-gray-700 cursor-pointer"
            />
          </div>
          <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400 select-none">
            <span className="font-bold text-gray-700 dark:text-gray-300">Data Privacy Consent:</span> By checking this box, you agree that your information will be collected and kept strictly confidential. It will be used solely for the purpose of the Hack & Hustle seminar registration and communication.
          </p>
        </label>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className={`w-full py-3 sm:py-4 px-4 mt-4 rounded-md text-white font-bold uppercase tracking-wider transition-all duration-200 
          ${isSubmitting 
            ? 'bg-[#8c4664] cursor-not-allowed' 
            : 'bg-[#6b1236] dark:bg-[#eeb211] dark:text-[#6b1236] hover:bg-[#4a0c25] dark:hover:bg-[#d49d0e] hover:shadow-lg active:scale-[0.98]'}`}
      >
        {isSubmitting ? 'Registering...' : 'Complete Registration'}
      </button>

      {/* About Link */}
      <div className="text-center mt-4 mb-2">
        <Link 
          to="/about" 
          className="text-sm font-bold text-gray-500 hover:text-[#6b1236] dark:text-gray-400 dark:hover:text-[#eeb211] transition-colors underline decoration-2 underline-offset-4"
        >
          What is Hack & Hustle?
        </Link>
      </div>

      {status.message && (
        <div className={`p-4 rounded-md text-center text-sm font-bold border mt-2 ${
          status.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 
          status.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 
          'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'}`}>
          {status.message}
        </div>
      )}
    </form>
  );
};

export default RegistrationForm;