import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export function SearchBar({ searchTerm, onSearchChange, suggestions, onSearchSubmit }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (event) => {
    onSearchChange(event.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion); 
    onSearchSubmit(suggestion); 
    setShowSuggestions(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearchSubmit(searchTerm); 
      setShowSuggestions(false); 
    }
  };

  return (
    <div class="search-container w-50 ">
      <input
        type="text"
        class="search-input "
        placeholder="Search by job title or company..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown} 
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul class="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
