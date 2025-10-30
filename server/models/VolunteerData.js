// Not required as a separate file if you embed all in User.js. 
// Otherwise, you can still use this pattern for expansion:

import mongoose from "mongoose";

const volunteerDataSchema = new mongoose.Schema({
  examPassed: { type: Boolean, default: false },
  examScore: { type: Number, default: 0 },
  isVolunteer: { type: Boolean, default: false },
  dateRegistered: { type: Date },
  isAvailable: { type: Boolean, default: true },
  location: { type: String },
  qualificationDate: { type: Date }
});

export default volunteerDataSchema;
