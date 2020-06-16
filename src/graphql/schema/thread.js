import { gql } from 'apollo-server-express';
// messages(cursor: String, limit: Int): [Message!]!
// messages(i_user: ID!): [Message]
export default gql`
  extend type Query {
    threads: [Thread]!
    thread(id: ID!): Thread
    searchMessage(queryString: String!): [SearchConnection]
  }


  input ThreadInput {
    members: [ID!]
    isGroup: Boolean!
    groupName: String
    ownersParam: [ID]
    isPrivate: Boolean
  }

  input AddUserInput {
    threadId: String!
    newMembers: [ID!]
  }

  input DeleteUserInput {
    threadId: String!
    memberId: ID!
  }

  input UpdateThreadInput {
    threadId: String!
    name: String
    isPrivate: Boolean
  }

  extend type Mutation {
    createThread(input: ThreadInput): Thread
    updateUserLastSeen(input: ThreadLastSeen): Thread
    addUserToThread(input: AddUserInput): Thread
    deleteUserFromThread(input: DeleteUserInput): Thread
    updateThread(input: UpdateThreadInput): Thread
  }

  type Thread {
    _id: ID!
    messages(cursor: ID, searchedCursor: ID, limit: Int): MessageConnection!
    snippet: Message
    msg_owner: Message
    members: [User]!
    isGroup: Boolean
    groupInfo: GroupInfo
  }


  type SearchConnection {
    thread: Thread
    matchedMessages: [Message]
  }

  type GroupInfo {
    name: String
    owners: [User]
    isPrivate: Boolean
  }

  input ThreadLastSeen {
    userId: String!
    threadId: String!
  }

  extend type Subscription {
    threadCreated: Thread!
    threadUpdated(userId: ID!): Thread!
    threadUpdatedUser(threadId: ID!): Thread
  }

`;
