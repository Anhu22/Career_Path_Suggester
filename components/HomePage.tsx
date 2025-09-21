

import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in-up max-w-3xl mx-auto">
      <SparklesIcon className="w-16 h-16 mx-auto text-blue-500 mb-6" />
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl md:text-7xl">
        Discover Your Future Career
      </h1>
      <p className="mt-6 text-xl text-gray-600 max-w-2xl">
        Our AI-powered advisor analyzes your skills and interests to generate personalized career recommendations, helping you navigate the evolving job market with confidence.
      </p>
      <div className="mt-10">
        <button
          onClick={onGetStarted}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-50 transition-transform transform hover:scale-105"
        >
          Get Started Now
          <ArrowRightIcon className="w-6 h-6 ml-3" />
        </button>
      </div>
    </div>
  );
};