const express = require('express');
const graphqlServer = require('../src/graphqlServer');

const db = require('../src/db');

db.connect((error) => {
  if (error) {
    console.error('Failed to connect to database', error.message);
    return;
  }
  
  console.log('connected to database');

  let app = express();
  app.use('/graphql', graphqlServer);
  app.listen(4000);
  
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});


