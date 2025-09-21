import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  required?: boolean;
}

export const AutocompleteTextarea: React.FC<AutocompleteTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  suggestions,
  required = false,
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSuggestions = (text: string) => {
    const parts = text.split(/,\s*/);
    const lastPart = parts[parts.length - 1];
    const existingValues = parts.slice(0, -1).map(p => p.trim().toLowerCase());

    let newFiltered: string[];

    if (lastPart.trim()) {
      const lowercasedInput = lastPart.toLowerCase();
      // Suggestions that include the input and are not already in the value
      newFiltered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(lowercasedInput) &&
          !existingValues.includes(suggestion.toLowerCase())
      );
    } else {
      // If the last part is empty (e.g., after "React, "), show general suggestions
      newFiltered = suggestions.filter(
        (suggestion) => !existingValues.includes(suggestion.toLowerCase())
      );
    }
    setFilteredSuggestions(newFiltered.slice(0, 5)); // Limit to 5 suggestions
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    updateSuggestions(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const parts = value.split(/,\s*/);
    parts[parts.length - 1] = suggestion;
    const newValue = parts.join(', ') + ', ';
    onChange(newValue);
    updateSuggestions(newValue); // Update suggestions for the new empty term
    
    // Refocus the textarea to continue typing
    setTimeout(() => {
        const textarea = document.getElementById(id) as HTMLTextAreaElement;
        if(textarea) textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
            setIsFocused(true);
            updateSuggestions(value); // Show suggestions on focus
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md h-24 focus:ring-blue-500 focus:border-blue-500"
        required={required}
        autoComplete="off"
      />
      {isFocused && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onMouseDown={(e) => { // Use onMouseDown to prevent blur event from firing first
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};