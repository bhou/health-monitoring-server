const db = require('../src/db');
const Patient = require('../src/db/schema/Patient');
const Record = require('../src/db/schema/Record');

function denodeify(func) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      let params = [...args, (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }];
      func.apply(this, params);
    })
  }
}

const connect = denodeify(db.connect);


function createPatientData(patientInfo) {
  let createPatient = denodeify((done) => new Patient(patientInfo).save(done));

  let createRecord = denodeify((patientId, done) => new Record({
    patientId: patientId,
    timestamp: Date.now(),
    bodyTemperature: {
      value: 37 + Math.floor(Math.random() * 4) - 2,
      unit: 'C'
    },
    bloodPressure: {
      systolic: {
        value: 120 + Math.floor(Math.random() * 40) - 20,
        unit: 'mmHg',
      },
      diastolic: {
        value: 90 + Math.floor(Math.random() * 20) - 10,
        unit: 'mmHg',
      }
    }
  }).save(done));

  return createPatient().then((patient) => {
    let records = [];

    for (let i = 0; i < 37; i++) {
      records.push(createRecord(patient.id));
    }

    return Promise.all(records);
  })
  .then((records) => {
    console.log(`${records.length} records are created`);
  })
  .catch((err) => {
    denodeify(db.disconnect)();
    console.error(err.message);
  });
}


connect()
  .then(() => {
    // create patients
    let patients = [
      createPatientData({
        name: 'John Smith',
        gender: 'Male',
        photo: 'https://bhou.github.io/health-monitoring-app/images/man.png',
        age: 36,
        bloodType: "B+",
      }),

      createPatientData({
        name: 'Anne',
        gender: 'Female',
        photo: 'https://bhou.github.io/health-monitoring-app/images/girl.png',
        age: 27,
        bloodType: "B+",
      }),

      createPatientData({
        name: 'Mike',
        gender: 'Male',
        photo: 'https://bhou.github.io/health-monitoring-app/images/boy.png',
        age: 19,
        bloodType: "B-",
      }),
    ]
    return Promise.all(patients);
  })
  .then((data) => {
    denodeify(db.disconnect)();
  })
  .catch((err) => {
    denodeify(db.disconnect)();
    console.error(err);
  });
