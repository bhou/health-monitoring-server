const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');

const schema = makeExecutableSchema({
  typeDefs: typeDefs, 
  resolvers: resolvers });

module.exports = graphqlHTTP({
  schema: schema,
  graphiql: true,
});
