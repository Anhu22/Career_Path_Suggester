
import React, { useState, useEffect } from 'react';

const messages = [
  "Analyzing your unique profile...",
  "Mapping skills to emerging careers...",
  "Consulting with our AI career oracle...",
  "Crafting your personalized roadmap...",
  "Finding your perfect career match...",
];

export const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-800 animate-fade-in">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="mt-6 text-lg font-semibold tracking-wide transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
      <p className="mt-2 text-sm text-gray-600">This may take a moment.</p>
    </div>
  );
};