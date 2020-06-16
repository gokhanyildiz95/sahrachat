import { gql } from 'apollo-server-express';

import user from './user';
import message from './message';
import thread from './thread';
import userStates from './userStates';
// import community from './community';
// import communityMember from './communityMember';
// import participant from './participant';
// import channel from './channel';

const linkSchema = gql`
  scalar Date

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }


  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

// export default [ linkSchema, communityMember, community, participant, channel, user, message ];
export default [linkSchema, user, message, thread, userStates];
