const mongoose = require('mongoose');

const JobsSchema = new mongoose.Schema({
   compnay_logo:String,
   company:String,
   company_link:String,
   job_name:String,
   job_link:String,
   location:String,
   posted:Number,
   job_des:String,
   job_type:String,
   salary:String,
});

const Jobs = mongoose.model('Jobs', JobsSchema);

module.exports = Jobs;