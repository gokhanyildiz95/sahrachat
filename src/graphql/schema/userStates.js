import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    userStates: [UserStates!]
    userState(i_user: ID!): UserStates
  }

  extend type Mutation {
      updateLastSeenUser: UserStates
      updateOnlineStatusUser(isOnline: Boolean): UserStates
  }

  type UserStates {
    user: User!
    lastSeen: Date
    lastActivity: Date
    isOnline: Boolean
    tenant: String
  }
`;
