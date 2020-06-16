import React from 'react';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';
import ConversationListItem from '../ConversationListItem';
import { graphql } from 'react-apollo';
import moment from 'moment';
import gql from 'graphql-tag';
import './ConversationList.css';
import { Spinner } from 'react-bootstrap';
import { threadMessages } from '../MessageList';
import { MemoSearchThreads } from '../SearchThreads';
import { ListAvailableThreads } from '../ListAvailableThreads';

import UIfx from 'uifx';



const newMessageRing = new UIfx(
  "https://mobikob.com/static/sound/new-mess-notif-on-focus.mp3",
  {
    volume: 0.8, // number between 0.0 ~ 1.0
    throttleMs: 100
  }
)

const LoadingIndicator = (props) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: '8vh',
      justifyContent: 'center',
    }}>
      <Spinner animation="border" role="status">
        <span className="sr-only">{props.text}</span>
      </Spinner>
    </div>
  )
}


const threadList = gql`
 {
    threads{
        isGroup
        groupInfo {
          name
          isPrivate
          owners {
            i_user
            name
            surname
          }
        }
        _id
        members{
            i_user
            username
            name
            surname
            lastSeen
            tenant
        }
        snippet {
            content
            id
            messageType
            parent {
                id
            }
            modifiedAt
            createdAt
            isDeleted
        }
    }
}
`;

const threadUpdated = gql`
subscription($userId: ID!) {
 threadUpdated(userId: $userId) {
        _id
        isGroup
        groupInfo {
          name
          isPrivate
          owners {
            i_user
            name
            surname
          }
        }
        members {
            i_user
            username
            name
            surname
            lastSeen
            tenant
        }
        msg_owner {
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
              name
              surname
            }
        }
      }
  }
`;

const getTimeStamp = (createdAt) => {
  return new Date(createdAt);
  /*
  const timestamp = id.toString().substring(0, 8)
  const date = new Date(parseInt(timestamp, 16) * 1000)
  return date;
  */
}

const callbackSort = (a, b) => {
  if (a.snippet && b.snippet) {
    return (moment(getTimeStamp(a.snippet.createdAt)).isAfter(getTimeStamp(b.snippet.createdAt))) ? -1 : 1
  }
  if (a.snippet || b.snippet)
    return 1;
  return 0;
}

const sortById = (threads) => {
  if (threads) {
    return threads.sort((a, b) => callbackSort(a, b))
  } else {
    console.error("threads couldnt fine", threads)
    return;
  }
}

const getMembers = (members, user_id) => {
  // return all members except the user if the user is not
  // the only one in the group
  if (members.length === 1) {
    return []
  }
  const filtered = members.filter(member => member.i_user !== user_id.toString())
  if (filtered.length === 0) {
    return [members[0]]
  }
  return filtered
}


const ConversationContainer = (props) => {
  const { threads, user, threadId, clickHandler, threadUnseens, match, first, webappUrl } = props;
  return (
    <div>
      {
        (threads && threads.length > 0) ?
          sortById(threads).map(thread => {
            const members = getMembers(thread.members, user.i_user)
            return (
              <ConversationListItem
                key={thread._id}
                active={thread._id === threadId}
                match={match}
                onClick={event => {
                  clickHandler(event, thread)
                }}
                threadUnseens={threadUnseens.filter(threadId => threadId === thread._id)}
                members={members}
                isGroup={thread.isGroup}
                groupInfo={thread.groupInfo}
                thread={thread}
                tenant={user.tenant}
                user={user}
                first={first}
              />
            )
          }) :
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignContent: "center"
            }}
          >
            Lütfen + butonuna tıklayıp yeni bir konuşma oluşturun.
      </div>
      }
    </div>

  )
}


class ConversationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  notifyMessage = async options => {
    if (!("Notification" in window)) {
      console.error("notifications are not supported");
      return;
    }
    if (document.hasFocus()) {
      if (Notification.permission !== 'denied') {
        console.log("conversationlist new message notig");
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Yeni mesaj!', options)
            .then(() => registration.getNotifications())
            .then(notifications => {
              setTimeout(() => notifications.forEach(notification => notification.close()), 1500);
            });
        });
      }
    }
  }

  componentDidMount() {
    this.props.data.subscribeToMore({
      document: threadUpdated,
      variables: {
        userId: this.props.user.i_user,
      },
      updateQuery: (prev, { subscriptionData }) => {
        console.log("comp sub to more data", subscriptionData)
        const thread = subscriptionData.data.threadUpdated
        // if the new message is not belong to owner
        if (!thread) return;
        if (thread.msg_owner && thread.msg_owner.user.i_user !== this.props.user.i_user.toString() &&
          thread._id !== this.props.threadId)
          this.props.onNewThreadMessage(thread._id);
        const { client } = this.props;
        // when convo out of focus we need to update it messages
        // from here. try catch is nessecary if the user never clicked
        // on any convo and apollo didnt built any cache
        if (document.visibilityState === "hidden") {
          console.log("hidden state check android", window.Android)
          if (typeof window.Android !== "undefined" && window.Android !== null) {
            window.Android.setCount(this.props.threadUnseens.length);
          } else {
            console.log("Not viewing in webview");
          }
        }
        try {
          console.log("client", client)
          if (client.cache.data.data.ROOT_QUERY) {
            const convo = client.readQuery({ query: threadMessages, variables: { threadId: thread._id } });
            const isActive = thread._id === this.props.threadId;
            if (!isActive) {
              const obj = Object.assign({}, convo, {
                thread: {
                  ...convo.thread,
                  messages: Object.assign({}, convo.thread.messages, {
                    edges: [...convo.thread.messages.edges, thread.msg_owner],
                  }),

                },
              })
              convo.thread.messages.edges.push(thread.msg_owner)
              client.writeQuery({ query: threadMessages, variables: { threadId: thread._id }, data: obj })
              // for android

              // end android
            }
          }
        } catch (err) {
          // TODO
          console.log("error reeading query", err)
        }
        if (!subscriptionData.data) return prev
        thread.snippet = thread.msg_owner;
        if (thread.snippet) {
          if (thread.snippet.user.i_user.toString() !== this.props.user.i_user.toString()) {
            (async () => {
              newMessageRing.setVolume(0.7).play();
            })();
            if (!this.props.history.location.pathname.includes('message')) {
              const user = thread.members.find(member => member.i_user === thread.snippet.user.i_user.toString())
              let ownerName = 'Yeni mesaj';
              if (user) {
                ownerName = `${user.name} ${user.surname}`
              }
              this.notifyMessage({
                body: `${thread.snippet}`,
                title: ownerName,
                tag: thread.snippet.id
              })

            }
          }
        }
        const newobj = Object.assign({}, prev, {
          threads: [thread, ...prev.threads.filter(othread => othread._id !== thread._id)]
        });
        console.log("newobj", newobj)
        return newobj;
      },
    });
  }

  notMe = (members) => { return members.filter(member => member.i_user !== this.props.user.i_user) }

  render() {
    const { data: { loading, threads }, setSearchActive, setSearchValue, searchValue, searchActive, lockSearch } = this.props;
    let first;
    let sortedThreads;
    if (!loading && threads) {
      sortedThreads = sortById(threads);
      first = sortedThreads.length > 0 ? sortedThreads[0]._id : undefined;
    }
    return loading ? <LoadingIndicator /> : (
      <div className="conversation-list">
        <MemoSearchThreads
          searchActive={searchActive}
          searchValue={searchValue}
          setSearchActive={setSearchActive.bind(this)}
          setSearchValue={setSearchValue.bind(this)}
          lockSearch={lockSearch}
        />
        {
          (searchActive) ?

            <ListAvailableThreads
              setMatchedMessages={this.props.setMatchedMessages}
              setMatchedMessage={this.props.setMatchedMessage}
              onThreadClick={this.props.clickHandler}
              searchValue={searchValue}
              searchActive={searchActive}
              userId={this.props.user.i_user}
              threads={threads} />
            :
            <ConversationContainer {...this.props} first={first} threads={threads} />
        }
      </div>

    )

  }
}

export default graphql(threadList)(ConversationList)
