const db = require('../src/db');
const Patient = require('../src/db/schema/Patient');
const Record = require('../src/db/schema/Record');

const TEST_PATIENT_NAME = 'TestPatient';

module.exports = {
  setUp: (cb) => {
    db.connect(cb);
  },
  tearDown: (cb) => {
    Patient.find({ name: TEST_PATIENT_NAME }).remove((err) => {
      db.disconnect(cb);
    });
  },
  testPatient: (test) => {
    const patient = new Patient({
      name: TEST_PATIENT_NAME,
      gender: 'Male',
      photo: 'http://localhost/john.png',
      age: 25,
      bloodType: 'A+'
    });
    
    test.ok(patient._id !== null);

    patient.save((error) => {
      if (error) throw error;

      // find it
      Patient.findById(patient._id, (err, obj) => {
        if (err) throw err;

        test.equal(patient._id.toString(), obj._id.toString());
        test.equal(patient.age, 25);

        Patient.find({ name: TEST_PATIENT_NAME }).remove((err) => {
          if (err) throw err;
          test.done();
        })
      });
    });
  },
  testRecord: (test) => {
    // create a patient
    const patient = new Patient({
      name: TEST_PATIENT_NAME,
      gender: 'Male',
      photo: 'http://localhost/john.png',
      age: 25,
      bloodType: 'A+'
    });

    patient.save((error) => {
      if (error) throw error;

      // create record
      let record = new Record({
        patientId: patient.id,
        timestamp: 0,
        bodyTemperature: {
          value: 37,
          unit: 'C'
        },
        bloodPressure: {
          systolic: {
            value: 120,
            unit: 'mmHg',
          },
          diastolic: {
            value: 90,
            unit: 'mmHg',
          }
        }
      });

      record.save((error) => {
        if (error) throw error;

        // find it
        Record.find({patientId: patient.id}).exec((err, records) => {
          if (err) throw error;

          test.ok(records.length > 0);
          
          // remove all records
          Patient.find({ name: TEST_PATIENT_NAME }).remove((err) => {
            if (err) throw err;

            Record.find({ timestamp: 0 }).remove((err) => {
              test.done();
            });
          });

        });
      });
    })
  }
}
