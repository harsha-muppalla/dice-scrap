export const FilterJobs = (jobs, filters, daysPosted,searchTerm) => {
  const { Contract, Full_time, Remote, locations } = filters;

  const anyLocationChecked = Object.values(locations).some(val => val === true);
  const anyTypeChecked = Contract || Full_time || Remote;
  const lowercasedSearchTerm = searchTerm.toLowerCase();
  return jobs.filter(job => {
    //days filtering
    const postedDaysAgo = job.posted ?? 0;
    if (postedDaysAgo > daysPosted) {
      return false;
    }
 if (searchTerm.trim() !== "") {
      const titleMatch = (job.title || '').toLowerCase() === lowercasedSearchTerm;
      const companyMatch = (job.company || '').toLowerCase() === lowercasedSearchTerm;
      
      // compnay or job title match
      if (!titleMatch && !companyMatch) {
        return false; 
      }
    }
    const rawJobType = (job.job_type || '');
    const jobLocation = (job.location || '').trim();

    //job type
    if (anyTypeChecked) {
      const normalizedJobType = rawJobType.toLowerCase().replace('_', '-');

      const isContractMatch = Contract && normalizedJobType === 'contract';
      const isFullTimeMatch = Full_time && normalizedJobType === 'full-time';
      
  
      // check for remote location .
      const isRemoteMatch = Remote && jobLocation.toLowerCase() === 'remote';

      if (!isContractMatch && !isFullTimeMatch && !isRemoteMatch) {
        return false;
      }
    }

    if (anyLocationChecked) {
      if (!locations[jobLocation]) {
        return false;
      }
    }
    
    return true;
  });
};