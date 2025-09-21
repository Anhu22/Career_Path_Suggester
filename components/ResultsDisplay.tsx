import React from 'react';
import { Career } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface CareerChoiceCardProps {
  career: Career;
  onSelect: () => void;
}

const CareerChoiceCard: React.FC<CareerChoiceCardProps> = ({ career, onSelect }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div>
      <h3 className="text-2xl font-bold text-gray-900">{career.title}</h3>
      <p className="mt-2 text-gray-600 h-24 overflow-hidden">{career.description.substring(0, 150)}...</p>
      <p className="mt-4 text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block">{career.averageSalary}</p>
    </div>
    <button
      onClick={onSelect}
      className="mt-6 w-full flex items-center justify-center px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      Choose this Path
      <ArrowRightIcon className="w-5 h-5 ml-2" />
    </button>
  </div>
);


interface CareerChoicesProps {
  careers: Career[];
  onSelect: (career: Career) => void;
  onReset: () => void;
}

export const CareerChoices: React.FC<CareerChoicesProps> = ({ careers, onSelect, onReset }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <SparklesIcon className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-4xl font-extrabold text-gray-900">Your AI-Generated Career Paths</h2>
        <p className="mt-4 text-lg text-gray-600">
          Based on your profile, here are three career paths. Choose one to explore in detail.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careers.map((career, index) => (
          <CareerChoiceCard 
            key={index} 
            career={career} 
            onSelect={() => onSelect(career)}
          />
        ))}
      </div>
       <div className="flex items-center justify-center mt-8">
        <button
          onClick={onReset}
          className="px-8 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Start Over
        </button>
       </div>
    </div>
  );
};