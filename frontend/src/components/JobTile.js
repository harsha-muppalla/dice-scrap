import "../App.js"
import 'C:/react/leaen/react1/job_scrapper/frontend/node_modules/bootstrap/dist/css/bootstrap.min.css';
export function JobTile({job}){
    return (
        <div class="job-card p-3 mx-5" >
            <div class="d-flex flex-row p-3">
            <a href={"https://www.dice.com" + job.company_link}><img src={job.compnay_logo}  class="shadow-dark imgg"/></a>
            <a class="pt-3 px-2" href={"https://www.dice.com" + job.company_link}><h1 class="company " >{job.company}</h1></a>
            <a class="ms-auto  py-3 applybutton"href={job.job_link}>Apply</a>
            </div>
            <a href={job.job_link}><h1 class="job px-4">{job.job_name}</h1></a>
             <div class="d-flex flex-row">
            <p class="jobd mx-4 px-2">{job.location}</p>
            <p class="jobd mx-1 px-2" >{job.posted === null ? "Today" : `${job.posted} days ago`}</p>
            </div>
            <p class="jobdd mx-4 p-2">{job.job_des}</p>            
            <div class="d-flex flex-row">
                <p class="jobd px-2 mx-4">{job.job_type}</p>
            
            <p class="jobd px-2 mx-1" >{job.salary==="N/A"? null:`${job.salary}`}</p>
            </div>
        </div>
    );
}
