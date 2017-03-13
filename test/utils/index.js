const Patient = require('../../src/db/schema/Patient');
const Record = require('../../src/db/schema/Record');

const ObjectId = require('mongoose').Types.ObjectId; 

module.exports = {
  denodeify(func) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        let params = [...args, (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }];
        func.apply(this, params);
      })
    }
  },
  
  createPatient(patientInfo, done) {
    const patient = new Patient(patientInfo);
    
    patient.save((error) => {
      if (error) throw error;
      // find it
      Patient.findById(patient._id, (err, obj) => {
        if (err) return done(err);
        return done(null, obj);
      });
    });
  },

  createPatientData(recordInfo, done) {
    let record = new Record(recordInfo);
    let id = recordInfo.patientId;

    if (typeof recordInfo.patientId === 'string') {
      id = new ObjectId(recordInfo.patientId);
    }

    record.save((error) => {
      if (error) return done(err);

      // find it
      Record.find({patientId: id}).exec((err, records) => {
        if (err) return done(err);
        return done(null, records);
      });
    });
  }
}
