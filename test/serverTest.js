const express = require('express');
const db = require('../src/db');
const graphqlServer = require('../src/graphqlServer');

let server = null;

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
    db.disconnect(() => {
      server.close();
      cb();
    });
  },
  testQueryPatient: (test) => {
    test.done();
  },
  testQueryPatientData: (test) => {
    test.done();
  }
}
