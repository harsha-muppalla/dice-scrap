import React, { useState } from 'react';

export function Filter({
  filters,
  uniqueLocations,
  daysPosted,
  onTypeChange,
  onLocationChange,
  onDaysChange
}) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const jobTypes = [
    { name: 'Contract', checked: filters.Contract },
    { name: 'Full_time', checked: filters.Full_time },
    { name: 'Remote', checked: filters.Remote }
  ];

  // location filtering
  const selectedLocations = Object.keys(filters.locations)
    .filter(loc => filters.locations[loc]);
  
  //location deselect handeling
  const handleLocationCancel = (locationName) => {
    const event = {
      target: {
        name: locationName,
        checked: false
      }
    };
    onLocationChange(event);
  };

  return (
    <div class="filters ">
      <div class="card">
        <div class="card-body text-center m-3 d-flex flex-column">
          <h4>Job Type</h4>
          {jobTypes.map(type => (
            <label class="check " key={type.name}>
              <input
                type="checkbox"
                name={type.name}
                checked={type.checked}
                onChange={onTypeChange}
              />
              <span>{type.name.replace('_', ' ')}</span>
            </label>
          ))}

          <hr class="" />

          <h4>Location</h4>
          <div class="multiselect-container">
            {}
            <div 
              class="multiselect-button" 
              onClick={() => setIsLocationOpen(!isLocationOpen)}
            >
              <div class="multiselect-tags-container">
                {selectedLocations.length > 0 ? (
                  selectedLocations.map(location => (
                    <div key={location} class="multiselect-tag">
                      {location}
                      <button 
                        class="multiselect-tag-cancel"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleLocationCancel(location);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <span class="multiselect-placeholder">Select Locations</span>
                )}
              </div>
              <span class="multiselect-arrow">{isLocationOpen ? '▲' : '▼'}</span>
            </div>

            {isLocationOpen && (
              <div class="multiselect-dropdown">
                {Array.isArray(uniqueLocations) && uniqueLocations.map(location => (
                  <label class="check" key={location}>
                    <input
                      type="checkbox"
                      name={location}
                      checked={filters.locations[location] || false}
                      onChange={onLocationChange}
                    />
                    <p>{location}</p>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr class="my-4" />

          <h4>Posted Within</h4>
          <div class="p-3">
            <span style={{"color":"#d8d3d3",}}>{daysPosted} days</span>
            <input
              type="range"
              name="daysPosted"
              min="1"
              max="30"
              value={daysPosted}
              onChange={onDaysChange}
              style={{ width: '100%', marginTop: '10px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}