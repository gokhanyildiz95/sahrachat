const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');


const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => {
    return 'Hello World';
  },
};

export const graphMW = graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
});
