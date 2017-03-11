const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
  name: String,
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  photo: String,
  age: Number,
  bloodType: { tyep: String }
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
