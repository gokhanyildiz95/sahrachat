import gql from 'graphql-tag';
import { graphql } from 'react-apollo';


export const threadMessages = gql`
query($threadId: ID!, $cursor: ID, $searchedCursor: ID, $limit: Int) {
    thread(id: $threadId){
        _id
        isGroup
        groupInfo {
            name
            owners {
                i_user
            }
        }
        members {
            i_user
            name
            surname
            lastSeen
            tenant
        }

        messages(cursor: $cursor, searchedCursor: $searchedCursor, limit: $limit) {
            edges {
                id
                content
                messageType
                parent {
                    id
                }
                modifiedAt
                createdAt
                isDeleted
                user {
                    i_user
                    username
                    tenant
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }

    }
}
`;
