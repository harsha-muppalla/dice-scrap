from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from pymongo import MongoClient, errors
import time
from itertools import zip_longest
import re
from datetime import datetime
import pytz

client = MongoClient("mongodb+srv://test:12345@cluster0.ztaa9f8.mongodb.net/")
db = client["jobsin"]
collection = db["jobs"]
collection.create_index("job_link", unique=True)
indian_tz=pytz.timezone('Asia/Kolkata')
current_time=datetime.now(indian_tz)
driver = webdriver.Chrome()
url = "https://www.dice.com/jobs?adminDistrictCode=CA&countryCode=US&latitude=36.778261&location=California%2C+USA&locationPrecision=State&longitude=-119.4179324&q=software+developer&radiusUnit=mi"
driver.get(url)

page_num = 1
total_inserted = 0
LIMIT = 50
all_scraped_jlinks = []

while total_inserted < LIMIT:
    print(f"🔎 Scraping page {page_num} ...")
    time.sleep(3)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    
    company_logo=[img['src'] for img in soup.select("img[aria-label='Company Logo']")]
    companies = [c.get_text(strip=True) if c.get_text(strip=True) else "N/A" for c in soup.select("a[href*='/company-profile/'] p")]
    company_links = [a['href'] for a in soup.select("a[href*='/company-profile/']")]
    job_name = [c.get_text(strip=True) if c.get_text(strip=True) else "N/A" for c in soup.select("a[data-testid='job-search-job-detail-link']")]
    job_links = [a['href'] for a in soup.select("a[data-testid='job-search-job-detail-link']")]
    job_loc_post = [c.get_text(strip=True) if c.get_text(strip=True) else "N/A" for c in soup.select("p.text-sm.font-normal.text-zinc-600")]
    job_location = job_loc_post[0::3]
    job_posted_i = job_loc_post[2::3]
    job_posted = []
    for jp in job_posted_i:
        match = re.search(r'\d+', jp)
        job_posted.append(int(match.group()) if match else None)
    job_des = [c.get_text(strip=True) if c.get_text(strip=True) else "N/A" for c in soup.select("p.line-clamp-2.h-10.shrink.grow.basis-0.text-sm.font-normal.text-zinc-900")]
    job_type = [c.get_text(strip=True) if c.get_text(strip=True) else "N/A" for c in soup.select("p[id='employmentType-label']")]
    job_salary = [c.get_text(strip=True) if c.get_text(strip=True) else "N/A" for c in soup.select("p[id='salary-label']")]

    documents = []
    for logo, company, clink, name, jlink, location, posted, desc, j_type, salary in zip_longest(
            company_logo, companies, company_links, job_name, job_links, job_location, job_posted, job_des, job_type, job_salary, fillvalue="N/A"):

        if jlink not in all_scraped_jlinks:
            documents.append({
                "company_logo": logo,
                "company": company,
                "company_link": clink,
                "title": name, 
                "job_link": jlink,
                "location": location,
                "posted": posted,
                "job_des": desc,
                "job_type": j_type,
                "salary": salary,
                "scrapped time":current_time,
            })
            all_scraped_jlinks.append(jlink)

        if len(all_scraped_jlinks) >= LIMIT:
            break

    if documents:
        try:
            result = collection.insert_many(documents, ordered=False)
            inserted_count = len(result.inserted_ids)
            total_inserted += inserted_count
            print(f"Inserted {inserted_count} new jobs (Total: {total_inserted})")
        except errors.BulkWriteError as bwe:
            inserted_count = bwe.details["nInserted"]
            total_inserted += inserted_count
            print(f" duplicates skipped. {inserted_count} new jobs (Total: {total_inserted})")

    if len(all_scraped_jlinks) >= LIMIT:
        print(f"Reached {LIMIT} jobs. Stopping scrape.")
        break

    try:
        next_button = driver.find_element(By.CSS_SELECTOR, "span[aria-label='Next']")
        driver.execute_script("arguments[0].click();", next_button)
        page_num += 1
    except:
        print(" No more pages found.")
        break

driver.quit()

db_job_links = [doc["job_link"] for doc in collection.find({}, {"job_link": 1, "_id": 0})]
removed_jobs_links = set(db_job_links) - set(all_scraped_jlinks)

if removed_jobs_links:
    result = collection.delete_many({"job_link": {"$in": list(removed_jobs_links)}})
    print(f" Removed {result.deleted_count} in scrapping")
else:
    print(" No jobs removed")