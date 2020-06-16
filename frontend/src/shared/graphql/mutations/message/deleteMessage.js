// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { threadMessages } from '../../queries/thread/getThreadMessageConnection';
export type DeleteMessageType = {
    data: {
        deleteMessage: boolean,
    },
};

export const deleteMessageMutation = gql`
  mutation deleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`;

const deleteMessageOptions = {
    props: ({ ownProps, mutate }) => ({
        ...ownProps,
        deleteMessage: id =>
            mutate({
                variables: {
                    id,
                },
                update: store => {
                    // Read the data from our cache for this query.
                    const data = store.readQuery({
                        query: threadMessages,
                        variables: {
                            threadId: ownProps.threadId,
                        },
                    });

                    data.thread.messages.edges = data.thread.messages.edges.filter(
                        ({ node }) => node.id !== id
                    );

                    // Write our data back to the cache.
                    store.writeQuery({ query: threadMessages, data, variables: { threadId: ownProps.threadId } })
                },
            }),
    }),
};

export default graphql(deleteMessageMutation, deleteMessageOptions);