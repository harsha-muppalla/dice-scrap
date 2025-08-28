dice scrapping:

since dice.com is a dynamic site i used selenium  and beautiful soup to scrape it the selenium navigates through dice.com has only 25 jobs per page and soup parses through html of the pages and using the css selectors i scraped company logo,name,company link,job name,link for the job,salary,type of job,location and salary ,some of them as css selectors that are identifiable and some were not to scrape the company name  i scraped using the a which company was in and while trying to scrape the job location there was no common seletor and i tried with the entire class name which matched with posted date also and a dot so i scraped by taking every first item in the list is job location and third is posted date and pytz lib i saved the scraped time and py mongoose everything is stored in mongo db and to take care of dupliactes i used the href of job link as unique element and everytime when we click update jobs it scrape the first 50 jobs and if previous jobs are not existing in those 50 it will think as job is removed from dice and using href value it will take care of duplicates 

Backend:

server.js
this is main file of backend it has all the api calls 

/api/jobs: Fetches all jobs

/api/location: Fetches  unique list of all job locations.

/api/suggestions: Provides autocomplete suggestions for the search bar.

/api/register & /api/login: user account creation and login.

/api/run-scrape: Manually trigger for scraper.

/api/scrape-status: Checks scraper  last run.

and using cron created a schedule to automate scrapping everyday

model(user.js & jobs.js ):
  stores the schema of user collection and jobs collection 


Frontend:

login page.js:
  this page handles the login and user account creation by using login and register to get and update user collection 

jobs-page.js:
it handles the use states of all the filtering to filter remote jobs or full time job or contract job and location based filtering and the no of days ago slider and calls the jobs and location for the frontend job tiles and renders and all the main page uis 

filter.js: 
ui handiling for all the filter components 

search bar.js:
ui handling for the serach bar its a autocomplete search that gives suggestion to match with either job title or company name 

jobtile:
ui handling to show all jobs displays all the job api call info 

util.js

the file handles the entire filtering logics since it a small db we can handle these logics in frontend after fetching the whole data for contract,fulltime and remote it goes the boolean if its true then it matches job type and job location and displays 

for days posted slider  we kept a min of 1 and max of 30 by using the number we stop at it does posted within filtering 

and for search it does string matching to handle the error of wrong spelling the autocomplete search bar takes care of it 

