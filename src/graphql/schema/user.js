import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]
    user(i_user: ID!): User
    searchUsers(queryString: String!): [User]
    me: User
  }

  type User {
    i_user: ID! 
    name: String
    surname: String
    username: String
    email: String
    extension: String,
    extension_pass: String,
    fs_server_domain: String,
    tenant: String
    dname: String
    messages: [Message!]
    threads: [Thread]
    lastSeen: Date,
  }
`;
