import { useEffect, useState } from "react";
import { JobTile } from "./components/JobTile";
import { Filter } from "./components/Filter";
import { SearchBar } from "./components/SearchBar";
import { FilterJobs } from "./components/Utils";
import './App.css'; 

export function JobsPage({user,onLogout}) {
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [isScraping, setIsScraping] = useState(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [daysPosted, setDaysPosted] = useState(30);
  const [allLocations, setAllLocations] = useState([]); 
  const [filters, setFilters] = useState({
    Contract: false,
    Full_time: false,
    Remote: false,
    locations: {} 
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [jobsResponse, locationsResponse, statusResponse] = await Promise.all([
          fetch("http://localhost:4000/api/jobs"),
          fetch("http://localhost:4000/api/location"),
          fetch("http://localhost:4000/api/scrape-status")
        ]);
        const jobsData = await jobsResponse.json();
        const locationsData = await locationsResponse.json();
        const statusData = await statusResponse.json();

        setJobs(jobsData);
        setAllLocations(locationsData);
        setScrapeStatus(statusData);
        if (statusData && statusData.status === 'running') {
            setIsScraping(true);
        }

        const locationFilters = locationsData.reduce((acc, loc) => {
          acc[loc] = false;
          return acc;
        }, {});
        setFilters(prev => ({ ...prev, locations: locationFilters }));
      } catch (error) {
        console.error('Fetching initial data failed:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/suggestions?query=${searchTerm}`);
          const data = await response.json();
          setSuggestions(data);
        } catch (error) { console.error("Failed to fetch suggestions:", error); }
      };
      const timerId = setTimeout(() => fetchSuggestions(), 300);
      return () => clearTimeout(timerId);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleRunScrape = async () => {
      setIsScraping(true);
      setScrapeStatus({ status: 'running' });
      try {
          const response = await fetch("http://localhost:4000/api/run-scrape", { method: 'POST' });
          const data = await response.json();
          if (!response.ok) {
              alert(data.message);
              setIsScraping(false);
          } else {
              alert(data.message);
          }
      } catch (error) {
          console.error("Failed to start scrape:", error);
          alert("Error starting the scraper.");
          setIsScraping(false);
      }
  };

  const handleSearchSubmit = (term) => setAppliedSearchTerm(term);
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value === "") setAppliedSearchTerm("");
  };
  const handleTypeChange = (event) => {
    const { name, checked } = event.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
  };
  const handleDaysChange = (event) => setDaysPosted(Number(event.target.value));
  const handleLocationChange = (event) => {
    const { name, checked } = event.target;
    setFilters(prev => ({ ...prev, locations: { ...prev.locations, [name]: checked } }));
  };

  const filteredJobs = FilterJobs(jobs, filters, daysPosted, appliedSearchTerm);

  return (
    <div className="App ">
      <div className="sticky-header p-3 flex-container">
        <div class=" d-flex flex-row">
          <h2>Jobs<button class="navt" >In</button></h2>
          <div class="ms-auto mx-2" >
            <span className="welcome-message">Welcome, {user.name}</span>
          <button class="navt p-1" onClick={handleRunScrape} disabled={isScraping}>
            {isScraping ? 'Scraping in Progress...' : 'Update Jobs'}
          </button>
          <button className="navt p-1" onClick={onLogout}>Logout</button>
        </div>
        </div>
        
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          suggestions={suggestions}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>

            <div className="flex-container">
        <div className="row mx-2">
          <div className=" col-lg-2 col-4  stick">
            <Filter
              filters={filters}
              uniqueLocations={allLocations}
              onTypeChange={handleTypeChange}
              onLocationChange={handleLocationChange}
              daysPosted={daysPosted}
              onDaysChange={handleDaysChange}
            />
          </div>
          <div className="col-lg-10 col-8">
            {filteredJobs.map(job => (
              <JobTile key={job._id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
