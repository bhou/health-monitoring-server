const mongoose = require('mongoose');

const temperatureSchema = mongoose.Schema({
  value: { type: Number, required: true },
  unit: { type: String, enum: ['C', 'F'], required: true }
});

const pressureSchema = mongoose.Schema({
  value: { type: Number, required: true },
  unit: { type: String, enum: ['mmHg'], required: true }
});

const bloodPressureSchema = mongoose.Schema({
  systolic: pressureSchema,
  diastolic: pressureSchema
});

const recordSchema = mongoose.Schema({
  patientId: { type: mongoose.Schema.ObjectId, required: true },
  timestamp: { type: Number, required: true },
  bodyTemperature: temperatureSchema,
  bloodPressure: bloodPressureSchema
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
