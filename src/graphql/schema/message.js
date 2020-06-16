import { gql } from 'apollo-server-express';
// messages(cursor: String, limit: Int): [Message!]!
// messages(i_user: ID!): [Message]
export default gql`

  extend type Query {
    messages(threadId: ID!, cursor: ID, searchedCursor: ID, limit: Int): MessageConnection!
    message(id: ID!): Message!
  }

  enum MessageTypes {
    text
    file
    media
    draftjs
  }

  input File {
    path: String!,
  }

  input MessageInput {
    threadId: String!
    content: String
    messageType: MessageTypes!
    parentId: String
    file: Upload
  }

  extend type Mutation {
    addMessage(message: MessageInput): Message!
    deleteMessage(id: ID!): Boolean!
    editMessage(id: ID, content: String!, messageType: MessageTypes!): Boolean!
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }

  type Message {
    id: ID!
    content: String!
    user: User!
    modifiedAt: Date
    createdAt: Date
    parent: Message
    messageType: MessageTypes
    isDeleted: Boolean
  }

  extend type Subscription {
    messageAdded: MessageAdded!
    messageUpdated(threadId: String): Message!
    newThreadMessage(threadId: String!): Message!
  }

  type MessageAdded {
    message: Message!
  }

`;
