import React from 'react';

const SlotDisplay = ({ slots }) => {
  return (
    // Changed to grid-cols-1 sm:grid-cols-2 for mobile responsiveness
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Hackathon Card */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg text-center border-l-4 border-[#6b1236] dark:border-[#eeb211] shadow-md transition-transform hover:-translate-y-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Hackathon</p>
        <p className="text-4xl font-extrabold text-[#6b1236] dark:text-[#eeb211]">
          {slots.hackathon}
          <span className="text-lg text-gray-400 dark:text-gray-500 font-medium"></span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Slots Available</p>
      </div>

      {/* Startup Card */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg text-center border-l-4 border-[#eeb211] dark:border-[#6b1236] shadow-md transition-transform hover:-translate-y-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Startup</p>
        <p className="text-4xl font-extrabold text-[#eeb211] dark:text-[#6b1236]">
          {slots.startup}
          <span className="text-lg text-gray-400 dark:text-gray-500 font-medium"></span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Slots Available</p>
      </div>
    </div>
  );
};

export default SlotDisplay;