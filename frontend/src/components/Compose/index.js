import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useMutation, useSubscription } from '@apollo/react-hooks';
import moment from 'moment';
import UserInput from '../UserInput';
import './Compose.css';
import { Tooltip, Popover, notification } from 'antd';
import DropzoneContext from '../../shared/dropzone_context';

const ADD_MESSAGE = gql`
    mutation($content: String!, $threadId: String!, $messageType: MessageTypes!) {
         addMessage(message: {content: $content, threadId: $threadId, messageType: $messageType}) {
            id
            content 
            messageType
            parent {
                id
            }
            modifiedAt
            isDeleted
            user {
                i_user
                username
            }
        }
    }
`;

const threadUpdatedUser = gql`
  subscription($threadId: ID!) {
  threadUpdatedUser(threadId: $threadId) {
    _id
      members {
          i_user
          username
          name
          surname
          lastSeen
          tenant
      }
    }
  }

`;

const callbackSort = (a, b) => {
  return (moment(getTimeStamp(a.createdAt)).isAfter(getTimeStamp(b.createdAt))) ? 1 : -1
}

const getTimeStamp = (createdAt) => {
  return moment(createdAt);
}

const sortByLastSeen = (a, b) => {
  return (moment(getTimeStamp(a.lastSeen)).isAfter(getTimeStamp(b.lastSeen))) ? -1 : 1
}

const listOfMembersViewedTheThread = (thread, userId, updatedMembers = []) => {
  // userId is the current users id
  const { messages, isGroup } = thread;
  let members;
  if (updatedMembers.length) {
    members = updatedMembers;
  } else {
    members = thread.members;
  }

  members = members.map(member => {
    if (!member.lastSeen)
      return {
        ...member,
        lastSeen: null,
      }
    else
      return member
  })

  const messagesx = messages.edges.sort((a, b) => callbackSort(a, b));
  const lastMessage = messagesx[messagesx.length - 1];
  if (!lastMessage) {
    return [];
  }
  if (isGroup) {
    // when thread is a group. It can have multiple person that saw the message.
    const members_ = members.filter(member => member.i_user !== userId.toString() && member.i_user !== lastMessage.user.i_user);
    if (members_) {
      const members_seen = members_.map(member => {
        if (moment(getTimeStamp(member.lastSeen)).isAfter(getTimeStamp(lastMessage.createdAt))) {
          return member;
        }
        return null;
      })
      var members_seen_filtered = members_seen.filter(function (el) {
        return el !== null;
      });
      return members_seen_filtered ? members_seen_filtered : [];
    }
  } else {
    let userData = members.filter(member => member.i_user !== userId.toString() && member.i_user !== lastMessage.user.i_user);
    if (userData.length)
      userData = userData[0];
    else
      return [];
    if (moment(getTimeStamp(userData.lastSeen)).isAfter(getTimeStamp(lastMessage.createdAt))) {
      return [userData,];
    } else {
      return [];
    }
  }


}

const TooltipUser = props => {
  return (
  <Tooltip title={moment(props.lastSeen).format('LLL')}>
    <span>{props.fullName}</span>
  </Tooltip>
  )
}

const ReadContent = props => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    {
      (props.users) &&
      props.users.sort((a, b) => sortByLastSeen(a, b)).map(user =>
        <TooltipUser key={user.i_user} lastSeen={user.lastSeen} fullName={`${user.name} ${user.surname}`} />
      )
    }
  </div>
);

const DotText = props => (
  (props.users.length > 0) &&
  <Popover content={<ReadContent users={props.users} />} title="Kullanıcılar">
    ve {props.users.length} kullanıcı.
    </Popover>
)

export const Compose = (props) => {
  const [firstMember, setFirstViewed] = useState([]);
  const [restMembers, setRestViewed] = useState([]);
  const [updatedData, setValues] = useState({})


  useSubscription(
    threadUpdatedUser,
    {
      onSubscriptionData(options) {
        setValues(() => options.subscriptionData);
        // return options.subscriptionData;
      },
      onError(error) {
        console.log("wooop", error);
      },
      variables: { threadId: props.threadId },
      shouldResubscribe: true,
    }
  );

  const [addMessage, {error, loading, data}] = useMutation(
    ADD_MESSAGE,
    {
      errorPolicy: 'all',
    }
    /*
    {
    update(cache, { data: {  addMessage } }) {
      // read cached data
        const data = cache.readQuery({ query: threadMessages, variables: {threadId: props.threadId}});
        // fetch messages
        const messages = data.thread.messages;
        // add latest message
        data.thread.messages = [...messages, addMessage]
        // write to cache
        console.log("updateing cache", data)
        cache.writeQuery({ query: threadMessages, variables: {threadId: props.threadId}, data})
      }
    }
    */
  );

  useEffect(() => {
    if (error) {
      notification.error({
          message: `Mesaj Gönderilemedi!`,
          description: '',
          placement: 'bottomRight',
        });
    }
  }, [error])

  useEffect(() => {
    if (Object.keys(updatedData).length !== 0) {
      const updatedMembers = updatedData.data.threadUpdatedUser.members;
      const membersViewed = listOfMembersViewedTheThread(props.thread, props.userId, updatedMembers)
      if (membersViewed) {
        const firstMember = membersViewed && membersViewed.length ? [membersViewed[0]] : [];
        const restMembers = membersViewed ? membersViewed.slice(1) : [];
        setFirstViewed(firstMember);
        setRestViewed(restMembers);
      }
    }
    else {
      const membersViewed = listOfMembersViewedTheThread(props.thread, props.userId)
      if (membersViewed) {
        const firstMember = membersViewed && membersViewed.length ? [membersViewed[0]] : [];
        const restMembers = membersViewed ? membersViewed.slice(1) : [];
        setFirstViewed(firstMember);
        setRestViewed(restMembers);

      }
    }
  }, [updatedData, props.thread])


  // const membersViewed = listOfMembersViewedTheThread(thread, userId)
  return (
    <div className="compose_">
      {
        (firstMember.length ) ?
        <div className="seen" style={{ display: "flex", paddingLeft: "30px" }}>
          {
            (restMembers.length) ? `Mesajı görüntüleyenler` : `Mesaj görüntülendi`
          }
          <div style={{ paddingLeft: "5px" }}>
            <ReadContent users={firstMember} />
          </div>
          <div style={{ paddingLeft: "5px", cursor: "pointer", textDecoration: "underline" }}>
            <DotText users={restMembers} />
          </div>
        </div> : ""
      }
      <DropzoneContext.Consumer >
        { dropzone =>
          <UserInput threadId={props.threadId} addMessage={addMessage} rightItems={[props.rightItems]} dropzone={dropzone}/>
        }

      </DropzoneContext.Consumer>
    </div>
  );


}