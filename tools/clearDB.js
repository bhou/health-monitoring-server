const db = require('../src/db');
const Patient = require('../src/db/schema/Patient');
const Record = require('../src/db/schema/Record');


db.connect(() => {
  Patient.remove({}, (error) => {
    if (error) {
      return console.error(error.message);
    }

    console.log('All patients cleared in db');

    Record.remove({}, (error) => {
      if (error) {
        return console.error(error.message);
      }

      console.log('All records cleared in db');

      db.disconnect();
    });
  });
})


