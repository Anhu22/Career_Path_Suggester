
import React, { useState, useCallback, useEffect } from 'react';
import { CareerForm } from './components/CareerForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CareerChoices } from './components/ResultsDisplay';
import { NotesDashboard } from './components/CareerCard';
import { Toast } from './components/Toast';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { getCareerSuggestions } from './services/geminiService';
import type { UserProfile, Career, ApiError } from './types';
import { HomePage } from './components/HomePage';

type View = 'home' | 'form' | 'loading' | 'choices' | 'notesDashboard';

function App() {
  const [view, setView] = useState<View>('home');
  const [careers, setCareers] = useState<Career[] | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Note: Sharing functionality will need to be re-evaluated for the new notes dashboard.
    // This part is kept for potential future use or backwards compatibility with old links,
    // but it currently doesn't map to the new notes dashboard state.
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const decodedData = JSON.parse(atob(hash));
        if (decodedData.careers && decodedData.profile) { 
            setCareers(decodedData.careers as Career[]);
            setUserProfile(decodedData.profile as UserProfile);
            setView('choices');
        }
      } catch (e) {
        console.error("Failed to parse shared data:", e);
        setError({ message: 'The shared link is invalid or corrupted.' });
        window.location.hash = ''; // Clear invalid hash
      }
    }
  }, []);

  const handleFormSubmit = useCallback(async (profile: UserProfile) => {
    setView('loading');
    setError(null);
    setCareers(null);
    setSelectedCareer(null);
    setUserProfile(profile);
    if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    try {
      const suggestions = await getCareerSuggestions(profile);
      setCareers(suggestions);
      setView('choices');
    } catch (err) {
      if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ message: 'An unknown error occurred.' });
      }
      setView('form'); // Revert to form on error
    }
  }, []);
  
  const handleCareerSelect = (career: Career) => {
    setSelectedCareer(career);
    setView('notesDashboard');
    window.scrollTo(0, 0);
  };

  const handleReset = useCallback(() => {
    setView('form');
    setCareers(null);
    setSelectedCareer(null);
    setUserProfile(null);
    setError(null);
    if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const renderContent = () => {
    switch(view) {
      case 'home':
        return <HomePage onGetStarted={() => setView('form')} />;
      case 'loading':
        return <LoadingSpinner />;
      case 'choices':
        if (!careers) return null; // Should not happen in this state
        return <CareerChoices careers={careers} onSelect={handleCareerSelect} onReset={handleReset} />;
      case 'notesDashboard':
        if (!selectedCareer) return null; // Should not happen
        return <NotesDashboard 
          career={selectedCareer}
          onReset={handleReset}
        />;
      case 'form':
        return (
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <SparklesIcon className="w-12 h-12 mx-auto text-blue-500 mb-4" />
              <h1 className="text-4xl font-extrabold text-gray-900">Career Path Finder</h1>
              <p className="mt-4 text-lg text-gray-600">
                Fill out your profile below, and our AI will generate personalized career path suggestions for you.
              </p>
            </div>
            {/* 
              FIX: The `isLoading` prop was previously set to `view === 'loading'`, which caused a
              TypeScript error because in this render branch, `view` is always 'form'.
              The form component is unmounted and replaced by a spinner during the 'loading'
              state, so its internal loading state is not used. Setting to `false` resolves the error.
            */}
            <CareerForm onSubmit={handleFormSubmit} isLoading={false} />
          </div>
        );
      default:
        // This case should not be reached with the strict View type, but it's a safe fallback.
        return <HomePage onGetStarted={() => setView('form')} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full flex-grow flex flex-col items-center pt-8">
        {renderContent()}
      </main>
      {error && <Toast message={error.message} onClose={() => setError(null)} type="error" />}
      {notification && <Toast message={notification} onClose={() => setNotification(null)} type="success" />}
    </div>
  );
}

export default App;