const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const db = require('./db');

// Construct a schema, using GraphQL schema language
const schema = require('./graphql/schema');

// The root provides a resolver function for each API endpoint
var root = {
  patients: (args, ctx) => {
    return Promise.resolve([
      {
        name: 'John Smith',
        gender: 'Male',
        photo: 'http://localhost:8080/images/test.png',
        age: 20,
        bloodType: 'Aplus',
        data: []
      }
    ]);
  },

  patientData: (args, ctx) => {
    let records = [];
    for (let i = 0; i < 10; i++) {
      records.push({
        id: Date.now(),
        patientId: args.patientId,
        timestamp: Date.now() + i * 1000 * 60 * 60,
        bodyTemperature: {
          "value": 37 + Math.floor(Math.random() * 4) - 2 ,
          "unit": "C"
        },
        bloodPressure: {
          systolic: {
            "value": 120 + Math.floor(Math.random() * 40) - 2 ,
            "unit": "mmHg"
          },
          diastolic: {
            "value": 80  + Math.floor(Math.random() * 40) - 2 ,
            "unit": "mmHg"
          }
        }
      });
    }
    return Promise.resolve(records);
  }
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

db.connect((error) => {
  if (error) {
    console.error('Failed to connect to database', error.message);
    return;
  }
  
  console.log('connected to database');
  app.listen(4000);
  
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});


