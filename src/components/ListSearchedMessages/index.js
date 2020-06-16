import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import moment from 'moment';
import { ThreadList } from '../ThreadList';

const callbackSort = (a, b) => {
  return (moment(a.createdAt).isAfter(moment(b.createdAt))) ? -1 : 1
}

const FIND_MESSAGES = gql`
    query ($queryString: String!) {
        searchMessage(queryString:$queryString) {
          thread {
            _id
            groupInfo {
                name
            }
            members{
                i_user
                username
                name
                surname
                lastSeen
                tenant
            }
            isGroup
          }
          matchedMessages{
                id
                content
                messageType
                createdAt
                isDeleted
          }
        }
    }

`

const getThreads = (data) => {
    const { searchMessage: results } = data;
    const threads = results.map(item => {
        const thread = item.thread
        thread.matchCount = item.matchedMessages.length
        thread.matchedMessages = item.matchedMessages
        return thread
    });
    return threads;
}

export const SearchedMessages = ({ searchValue, userId, onThreadClick, setMatchedMessages, setMatchedMessage }) => {
    const { loading, error, data } = useQuery(FIND_MESSAGES, {
        variables: { queryString: searchValue },
    });


    const onCustomClick = (event, thread) => {
        console.log("orj mat", thread.matchedMessages, "sorted", thread.matchedMessages.sort((a, b) => callbackSort(a, b)))
        setMatchedMessages(thread.matchedMessages.sort((a, b) => callbackSort(a, b)))
        const matchedMessageCurr = thread.matchedMessages ? thread.matchedMessages[0] : [];
        setMatchedMessage(matchedMessageCurr)
        onThreadClick(event, thread);
    }

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

    return (
        <div>
            {
                (data) ?
                    <ThreadList
                        threads={getThreads(data)}
                        userId={userId}
                        onThreadClick={onCustomClick}
                    /> :
                    <div></div>
            }
        </div>
    )
}