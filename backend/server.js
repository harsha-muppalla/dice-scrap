const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const { spawn } = require("child_process"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jobs = require("./model/jobs");
const User = require("./model/user");

const app = express();
app.use(express.json()); 
app.use(cors());
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://test:12345@cluster0.ztaa9f8.mongodb.net/jobsin")
  .then(() => console.log("DB connected"))
  .catch(err => console.log("Unable to connect", err));
//user reg
app.post("/api/register", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});
//user login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign({ id: user._id, name: user.name }, "your_jwt_secret", { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});


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