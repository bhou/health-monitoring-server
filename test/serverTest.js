const express = require('express');
const request = require('request');
const rp = require('request-promise');

const db = require('../src/db');
const graphqlServer = require('../src/graphqlServer');

const Patient = require('../src/db/schema/Patient');
const Record = require('../src/db/schema/Record');

const utils = require('./utils/index');

let server = null;

const TEST_PATIENT_NAME = 'TestPatient';
const TEST_RECORD_TIMESTAMP = 100;


module.exports = {
  setUp: (cb) => {
    db.connect((error) => {
      if (error) {
        console.error('Failed to connect to database', error.message);
        return;
      }

      let app = express();
      app.use('/graphql', graphqlServer);
      server = app.listen(4001);
      
      cb();
    });
  },
  tearDown: (cb) => {
    Patient.find({ name: TEST_PATIENT_NAME }).remove((err) => {
      Record.find({ timestamp: 100 }).remove((err) => {
        db.disconnect(() => {
          server.close();
          cb();
        });
      });
    });
  },
  testQueryPatient: (test) => {
    utils.createPatient({
      name: TEST_PATIENT_NAME,
      gender: 'Male',
      photo: 'http://localhost/john.png',
      age: 25,
      bloodType: 'A+'
    }, (err, patient) => {
      request({
        url: 'http://localhost:4001/graphql',
        method: 'POST',
        json: {
          query: `query getPatients($n: Int) 
            {
              patients(n: $n) { 
                id 
                name 
                gender 
                age 
                bloodType 
              }
            }`
        }
      }, (err, res, body) => {
        if (body.error) test.ok(false, body.error);
        
        
        
        let found = body.data.patients.find((p) => {
          return p.id === patient.id; 
        });

        test.ok(found != null);
        test.equal(found.gender, 'Male');
        test.equal(found.age, 25);
        test.equal(found.bloodType, 'A+');

        test.done();
      });
    });
  },
  testQueryPatientData: (test) => {
    utils.createPatient({
      name: TEST_PATIENT_NAME,
      gender: 'Male',
      photo: 'http://localhost/john.png',
      age: 25,
      bloodType: 'A+'
    }, (err, patient) => {
      if (err) {
        test.ok(false, err.message);
        return test.done();
      }
      utils.createPatientData({
        patientId: patient.id,
        timestamp: TEST_RECORD_TIMESTAMP,
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
      }, (err, records) => {
        request({
          url: 'http://localhost:4001/graphql',
          method: 'POST',
          json: {
            query: `query getPatientData($id: ID, $startTime: Date, $endTime: Date, $offset: Int, $count: Int) {
                patientData(id: $id, startTime: $startTime, endTime: $endTime, offset: $offset, count: $count) {
                  id
                  patientId
                  timestamp
                  bodyTemperature {
                    value
                    unit
                  }
                  bloodPressure {
                    systolic {
                      value
                      unit
                    }
                    diastolic {
                      value
                      unit
                    }
                  }
                }
              }`,
            variables: {
              "id": patient.id,
              "offset": 0,
              "count": 10
            }
          }
        }, (err, res, body) => {
          if (body.error) test.ok(false, body.error);
          
          let patientData = body.data.patientData;

          test.equal(patientData.length, 1);
          test.equal(patientData[0].bodyTemperature.value, 37);
          test.equal(patientData[0].bloodPressure.systolic.value, 120);
          test.equal(patientData[0].bloodPressure.diastolic.value, 90);

          test.done();
        });
      });
    })

  },

  testUpdateRecord: (test) => {
    let patientId = null;
    let recordId = null;
    utils.denodeify(utils.createPatient)({
      name: TEST_PATIENT_NAME,
      gender: 'Male',
      photo: 'http://localhost/john.png',
      age: 25,
      bloodType: 'A+'
    })
    .then((patient) => {
      patientId = patient.id;
      return utils.denodeify(utils.createPatientData)({
        patientId: patient.id,
        timestamp: TEST_RECORD_TIMESTAMP,
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
      })
    })
    .then((records) => {
      recordId = records[0].id;
      return rp({
        url: 'http://localhost:4001/graphql',
        method: 'POST',
        json: {
          query: `mutation updateRecord($recordId: ID, $bodyTemperature: Float, $systolicPressure: Float, $diastolicPressure: Float) {
            updateRecord(recordId: $recordId, bodyTemperature: $bodyTemperature, systolicPressure: $systolicPressure, diastolicPressure: $diastolicPressure) {
              id
              bodyTemperature {
                value
                unit
              }
              bloodPressure {
                systolic {
                  value
                  unit
                }
              }
            }
          }`,
          variables: {
            "recordId": recordId,
            "bodyTemperature": 37,
            "systolicPressure": 120,
            "diastolicPressure": 85
          }
        }
      });
    })
    .then(() => {
      return utils.denodeify(function(id, done) {
        Record.findById(id, done);
      })(recordId);
    })
    .then((record) => {
      test.equal(record.bodyTemperature.value, 37);
      test.equal(record.bloodPressure.systolic.value, 120);
      test.equal(record.bloodPressure.diastolic.value, 85);
      test.done();
    })
    .catch((err) => {
      test.ok(false, err.message);
      test.done();
    })
  }
}
