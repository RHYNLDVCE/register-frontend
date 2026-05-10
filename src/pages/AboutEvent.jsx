import React from 'react';
import { Link } from 'react-router-dom';

const AboutEvent = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300 p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#6b1236] dark:text-[#eeb211] mb-6 text-center tracking-tight">
          About Hack & Hustle
        </h2>
        
        <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
          <p>
            <strong>Hack & Hustle</strong> is MSU-TCTO's premier technology and innovation seminar. Designed for aspiring cybersecurity enthusiasts and tech entrepreneurs, this event is split into two specialized tracks:
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              {/* Lightning Bolt Icon */}
              <svg className="w-6 h-6 text-[#eeb211] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Startup Track
            </h3>
            {/* Expanded description for better visual balance */}
            <p className="text-sm">Learn the fundamentals of building a resilient tech startup from the ground up. This track guides participants through validating initial ideas, developing a Minimum Viable Product (MVP), and crafting a compelling business pitch to secure funding from potential investors.</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              {/* Terminal Icon */}
              <svg className="w-6 h-6 text-[#eeb211] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Hackathon Track
            </h3>
            {/* Offensive Security and CTF focused description */}
            <p className="text-sm">Dive into offensive security and ethical hacking. This track features intensive Capture The Flag (CTF) sessions designed to test cybersecurity skills, solve complex vulnerabilities, and prepare participants for advanced, real-world cyber scenarios.</p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic mt-4">
            Note: Slots are strictly limited to 15 participants per track.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <Link 
            to="/" 
            className="inline-block bg-[#6b1236] dark:bg-[#eeb211] dark:text-[#6b1236] hover:bg-[#4a0c25] dark:hover:bg-[#d49d0e] text-white font-bold py-3 px-8 rounded-md transition-colors shadow-md"
          >
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutEvent;