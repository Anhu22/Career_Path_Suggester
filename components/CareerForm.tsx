import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { AutocompleteTextarea } from './AutocompleteTextarea';
import { JOB_ROLES, SKILL_SUGGESTIONS, INTEREST_SUGGESTIONS } from '../data/suggestions';

interface CareerFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

export const CareerForm: React.FC<CareerFormProps> = ({ onSubmit, isLoading }) => {
  const [currentRole, setCurrentRole] = useState(JOB_ROLES[0]);
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !isFormValid) return;

    onSubmit({
      currentRole,
      yearsOfExperience: Number(yearsOfExperience),
      skills: skills.replace(/,\s*$/, ''), // Remove trailing comma
      interests: interests.replace(/,\s*$/, ''), // Remove trailing comma
    });
  };
  
  const isFormValid = currentRole && yearsOfExperience !== '' && Number(yearsOfExperience) >= 0 && skills && interests;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      <div className="space-y-2">
        <label htmlFor="currentRole" className="block text-sm font-medium text-gray-700">
          Current or Most Recent Role
        </label>
        <select
          id="currentRole"
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {JOB_ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <input
          id="experience"
          type="number"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="e.g., 5"
          className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
          min="0"
        />
      </div>

      <AutocompleteTextarea
        id="skills"
        label="Your Skills (type to see suggestions)"
        value={skills}
        onChange={setSkills}
        placeholder="e.g., React, Node.js, Python"
        suggestions={SKILL_SUGGESTIONS}
        required
      />

      <AutocompleteTextarea
        id="interests"
        label="Your Interests & Passions (type to see suggestions)"
        value={interests}
        onChange={setInterests}
        placeholder="e.g., Artificial Intelligence, Sustainable Energy"
        suggestions={INTEREST_SUGGESTIONS}
        required
      />
      
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full flex items-center justify-center px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Generating...' : 'Discover My Career Path'}
      </button>
    </form>
  );
};