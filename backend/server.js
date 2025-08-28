const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const { spawn } = require("child_process"); 
const jobs = require("./model/jobs");

const app = express();
app.use(cors());
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://test:12345@cluster0.ztaa9f8.mongodb.net/jobsin")
  .then(() => console.log("DB connected"))
  .catch(err => console.log("Unable to connect", err));

//web scrapper handling
const ScrapeLogSchema = new mongoose.Schema({
  _id: { type: String, default: "scrape_log" }, 
  lastScraped: Date,
  status: String ,
});
const ScrapeLog = mongoose.model("ScrapeLog", ScrapeLogSchema);


const runScraper = async () => {
  const log = await ScrapeLog.findById("scrape_log");
  if (log && log.status === 'running') {
    console.log("Scraper is already running. Skipping this run.");
    return;
  }

  console.log("Scraping process initiated...");
  await ScrapeLog.findOneAndUpdate({ _id: "scrape_log" }, { status: "running" }, { upsert: true });

  const pythonProcess = spawn('python', ['jscrap.py']); 

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Scraper: ${data}`); 
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Scraper Error: ${data}`);
  });

  pythonProcess.on('close', async (code) => {
    const finalStatus = code === 0 ? "success" : "failed";
    console.log(`Scraping process finished with status: ${finalStatus}`);
    await ScrapeLog.findOneAndUpdate(
      { _id: "scrape_log" },
      { lastScraped: new Date(), status: finalStatus },
      { upsert: true }
    );
  });
};

// automation for 2am everyday scrapping
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled daily scrape...');
  runScraper();
});

//mnanual scrapping trigger
app.post("/api/run-scrape", async (req, res) => {
  const log = await ScrapeLog.findById("scrape_log");
  if (log && log.status === 'running') {
    return res.status(409).json({ message: "Scraper is already running." });
  }
  
  runScraper();
  res.status(202).json({ message: "Scraping process has been started." });
});

//scrapping api
app.get("/api/scrape-status", async (req, res) => {
  try {
    const log = await ScrapeLog.findById("scrape_log");
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scrape status" });
  }
});

// entire job collection api call
app.get("/api/jobs", async (req, res) => {
  try {
    const allJobs = await jobs.find({}).sort({ createdAt: -1 });
    res.json(allJobs);
  } catch (error) { res.status(500).json({ message: 'Error fetching jobs' }); }
});
//locations api call
app.get("/api/location", async (req, res) => {
  try {
    const locations = await jobs.distinct('location');
    res.json(locations.filter(loc => loc));
  } catch (error) { res.status(500).json({ message: 'Error fetching locations' }); }
});
//compnay names and job title api call for search 
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    const regex = new RegExp(query, 'i');
    const jobTitleSuggestions = await jobs.distinct('title', { title: regex });
    const companyNameSuggestions = await jobs.distinct('company', { company: regex });
    const suggestions = [...new Set([...jobTitleSuggestions, ...companyNameSuggestions])];
    res.json(suggestions.slice(0, 10));
  } catch (error) { res.status(500).json({ message: 'Error fetching suggestions' }); }
});

app.listen(4000, () => {
  console.log("Backend started on port 4000");
});