import gql from 'graphql-tag';

export const editMessageMutation = gql`
  mutation editMessage($id: ID!, $content: String!, $messageType: MessageTypes!) {
    editMessage(id: $id, content: $content, messageType: $messageType)
  }
`;