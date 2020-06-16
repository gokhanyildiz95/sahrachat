import React from 'react';
import { Result } from 'antd';
import moment from 'moment';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import Icon, { SvgWrapper } from '../icon';
import { Compose } from '../Compose';
import { Message } from '../Message';

import { MatchedMessages } from '../MatchedMessagesContainer';
//import { Query } from 'react-apollo';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { IoIosCall } from "react-icons/io";
import PerfectScrollbar from 'react-perfect-scrollbar';
//import SimpleBar from 'simplebar-react';
//import 'simplebar/dist/simplebar.min.css';
import { ChatInputWrapper } from '../layout';
import { MessagesContainer, ViewContent, MessagesScrollWrapper, MessagesWrapper } from './style';
import AddNewUserThreadModal from '../AddNewUserThreadModal';
import EditMesageModal from '../EditMessageModal';
import {
    PrimarySecondaryColumnGrid,
    PrimaryColumn,
    SecondaryColumn,
    ShowOnMobile,
} from '../layout';

import './MessageList.css';
import { Spinner } from 'react-bootstrap';
import MessageSidebar from './MessageSidebar';

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
            isPrivate
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

const newThreadMessageSubscription = gql`
subscription($threadId: String!) {
  newThreadMessage(threadId: $threadId) {
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
      lastSeen
    }
  }
}
`;

const threadMessageUpdatedSubscription = gql`
subscription($threadId: String!) {
  messageUpdated(threadId: $threadId) {
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
      lastSeen
    }
  }
}
`;


const getMembers = (members, userId) => {
    // return all members except the user if the user is not
    // the only one in the group

    if (members.length === 1) {
        return []
    }
    const filtered = members.filter(member => member.i_user !== userId.toString())
    if (filtered.length === 0) {
        return [members[0]]
    }
    return filtered
}



const listOfMembersViewedTheThread = (thread, userId) => {
    // userId is the current users id
    const { messages, members, isGroup } = thread;
    const messagesx = messages.edges.sort((a, b) => callbackSort(a, b));
    const lastMessage = messagesx[messagesx.length - 1];
    if (isGroup) {
        // when thread is a group. It can have multiple person that saw the message.
        const members_ = members.filter(member => member.i_user !== userId.toString());
        if (members_) {
            const members_seen = members_.map(member => {
                if (moment(getTimeStamp(member.lastSeen)).isAfter(getTimeStamp(lastMessage.createdAt))) {
                    return member;
                }
                return null;
            })
            var members_seen_filtered = members_seen.filter(function (el) {
                return el != null;
            });
            return members_seen_filtered ? members_seen_filtered : [];
        }
    } else {
        let userData = members.filter(member => member.i_user === userId);
        if (userData.length)
            userData = userData[0];
        else
            return false;
        if (lastMessage.user.i_user !== userId && moment(getTimeStamp(userData.lastSeen)).isAfter(getTimeStamp(lastMessage.createdAt))) {
            return userData;
        } else {
            return [];
        }
    }


}

const SendButton = (props) => {
    return (
        <div className={`sendbutton`}
        >
            <svg height="36px" width="36px" viewBox="0 0 36 36"><g fill="none" fillRule="evenodd"><g><polygon points="0 36 36 36 36 0 0 0"></polygon><path d="M31.1059281,19.4468693 L10.3449666,29.8224462 C8.94594087,30.5217547 7.49043432,29.0215929 8.17420251,27.6529892 C8.17420251,27.6529892 10.7473302,22.456697 11.4550902,21.0955966 C12.1628503,19.7344961 12.9730756,19.4988922 20.4970248,18.5264632 C20.7754304,18.4904474 21.0033531,18.2803547 21.0033531,17.9997309 C21.0033531,17.7196073 20.7754304,17.5095146 20.4970248,17.4734988 C12.9730756,16.5010698 12.1628503,16.2654659 11.4550902,14.9043654 C10.7473302,13.5437652 8.17420251,8.34697281 8.17420251,8.34697281 C7.49043432,6.9788693 8.94594087,5.47820732 10.3449666,6.1775158 L31.1059281,16.553593 C32.298024,17.1488555 32.298024,18.8511065 31.1059281,19.4468693" fill="#0099ff"></path></g></g></svg>
        </div>
    )
}

const getTimeStamp = (createdAt) => {
    return moment(createdAt);
}

const callbackSort = (a, b) => {
    return (moment(getTimeStamp(a.createdAt)).isAfter(getTimeStamp(b.createdAt))) ? 1 : -1
}

const getFullName = (members, i_user) => {
    const user = members.filter(member => member.i_user === i_user)
    if (user.length > 0)
        return `${user[0].name} ${user[0].surname}`
    return null
}

const findMessageSequences = (members, i_user, currMessage, messages, tMessages, currIndex) => {
    /*
        Checks whether given message has more or had before or just single.
    */
    const previous = messages.length > 0 ? messages[messages.length - 1] : null;
    const next = tMessages.length > currIndex + 1 ? tMessages[currIndex + 1] : null;
    const currMoment = getTimeStamp(currMessage.createdAt);
    let startsSequence = true;
    let endsSequence = true;
    let showTimestamp = true;
    if (previous) {
        const prevMoment = moment(previous.props.data.createdAt);
        const prevDur = moment.duration(currMoment.diff(prevMoment));
        const isMessageBySameAuthor = currMessage.user.i_user.toString() === previous.props.userId;

        if (isMessageBySameAuthor && prevDur.as('hours') < 1) {
            startsSequence = false;
        }

        if (prevDur.as('days') < 1) {
            showTimestamp = false;
        }
        if (prevMoment.day() !== currMoment.day()) {
            showTimestamp = true;
        } else {
            showTimestamp = false;

        }
    }
    if (next) {
        const nextMoment = getTimeStamp(next.createdAt);
        const nextDur = moment.duration(nextMoment.diff(currMoment));
        const isMessageBySameAuthor = currMessage.user.i_user.toString() === next.user.i_user.toString();

        if (isMessageBySameAuthor && nextDur.as('hours') < 8) {
            endsSequence = false;
        }
    }
    return { startsSequence, endsSequence, showTimestamp }
}

const getMessages = (thread, userId, matchedMessage, setEditMessageModalVisible, setEditMessageContent) => {
    const messages = [];
    const members = thread.members;
    const messagesx = thread.messages.edges.sort((a, b) => callbackSort(a, b))
    /* eslint-disable-next-line */
    messagesx.map((message, index) => {
        const matched = matchedMessage ? matchedMessage.id === message.id : false;
        let fullName = getFullName(members, message.user.i_user)
        let userData = members.filter(member => member.i_user === message.user.i_user);
        if (userData.length) {
            userData = userData[0];
        } else {
            userData = {};
        }
        //console.log("messages", messages.length > 0 ? messages[messages.length-1].props.userId : null, "user", message.user.i_user, "mesages", messages)
        const sequences = findMessageSequences(members, message.user.i_user, message, messages, thread.messages.edges, index)
        messages.push(<Message
            data={message}
            key={message.id}
            direction={message.user.i_user === userId.toString() ? 'sent' : 'received'}
            fullName={fullName}
            userData={userData}
            threadId={thread._id}
            setEditMessageModalVisible={setEditMessageModalVisible}
            setEditMessageContent={setEditMessageContent}
            startsSequence={sequences.startsSequence}
            endsSequence={sequences.endsSequence}
            showTimestamp={sequences.showTimestamp}
            userId={message.user.i_user}
            changed={messages.length > 0 ? messages[messages.length - 1].props.userId !== message.user.i_user.toString() : true}
            matched={matched}
        />
        );
    })
    return messages;
}

// const ConditionalWrap = ({condition, wrap , children}) => condition ? wrap(children): children;


class MessageList extends React.PureComponent {
    //static whyDidYouRender = true

    constructor(props) {
        super(props)
        this.state = {
            windowClass: 'full',
            showMessageDetails: false,
            showUserThreadModal: false,
            showEditMessageModal: false,
            editMessage: {},
            // keep action type to determien whether should scroll to bottom or keep the position
            lastAction: 'toMore',
            messIndex: 0,
        }
        this.end = null;
        this.subscription = null;


    }

    scrollToBottom() {
        if (this.end)
            this.end.scrollIntoView({})
        /*
        setTimeout(() => {
            if (this.end)
                this.end.scrollIntoView({})
        }, 500);
        */
    }


    componentDidUpdate(prev, _, snapshot) {
        // scroll to the latest id keep current position
        if (prev.visibility.isVisible === false && this.props.visibility.isVisible === true) {
            this.props.setUserLastSeen();
        }
        if (snapshot && this.state.lastAction === 'fetchMore') {
            const messageElement = document.getElementById("id_" + snapshot.lastElem);
            if (messageElement) messageElement.scrollIntoView({});
        } else if (snapshot && Object.keys(this.props.matchedMessage).length > 0) {
            const messageElement = document.getElementById("id_" + this.props.matchedMessage.id);
            console.log("matched Message componentDIDUPDATEE", messageElement)
            if (messageElement) {
                setTimeout(() => {
                    messageElement.scrollIntoViewIfNeeded({});
                }, 400)
            }
        }
        else {
            this.scrollToBottom();
        }


    }

    getSnapshotBeforeUpdate(prev) {
        // get top element id before updating view
        if (prev.data.loading) return null;
        if (!prev.data.thread) return null;
        if (!prev.data.thread.messages || prev.data.thread.messages.edges.length === 0) {
            return null;
        }
        return {
            lastElem: prev.data.thread.messages.edges[0].id
        }
    }



    componentDidMount() {
        const { threadId } = this.props;
        let { subscribeToMore } = this.props.data
        this.subscription = [subscribeToMore(
            {
                document: newThreadMessageSubscription,
                variables: {
                    threadId,
                },
                updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev
                    const newMessage = subscriptionData.data.newThreadMessage;

                    let obj = Object.assign({}, prev, {
                        thread: {
                            ...prev.thread,
                            snippet: newMessage,
                            messages: Object.assign({}, prev.thread.messages, {
                                edges: [...prev.thread.messages.edges, newMessage]
                            }
                            ),
                        }
                    })
                    const isVisible = this.props.visibility.isVisible;
                    if (isVisible) {
                        this.props.setUserLastSeen();
                    }

                    this.setState({
                        lastAction: 'toMore',
                    });
                    return obj;
                },
            }
        ),
        subscribeToMore(
            {
                document: threadMessageUpdatedSubscription,
                variables: {
                    threadId,
                },
                updateQuery: (previousResult, { subscriptionData }) => {
                    console.log("new message updated", subscriptionData)

                    previousResult.thread.messages.edges = previousResult.thread.messages.edges.map((edge) => {
                        if (edge.id === subscriptionData.data.messageUpdated.id) {
                            return subscriptionData.data.messageUpdated
                        } else {
                            return edge
                        }
                    })
                    return previousResult
                }
            }
        )
        ]

        this.scrollToBottom()
    }


    loadOlderMessages() {
        // load more messages when cursor hits top
        // console.log("next page", this.props.data.pageInfo.hasNextPage);
        const hasNextPage = this.props.data.thread.messages.pageInfo.hasNextPage;
        if (hasNextPage) {
            this.props.data.fetchMore({
                variables: {
                    threadId: this.props.threadId,
                    limit: 10,
                    cursor: this.props.data.thread.messages.pageInfo.endCursor,
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                    this.setState({
                        lastAction: 'fetchMore',
                    });
                    let obj = Object.assign({}, prev, {
                        thread: {
                            ...prev.thread,
                            messages: Object.assign({}, prev.thread.messages, {
                                edges: [...fetchMoreResult.thread.messages.edges, ...prev.thread.messages.edges],
                                pageInfo: fetchMoreResult.thread.messages.pageInfo
                            }),
                        },
                    })
                    return obj;
                }
            });
        }
    }

    toggleMinimize = (event) => {

    }

    setEditMessageContent = (message) => {
        this.setState({
            editMessage: message
        })
    }

    setEditMessageModalVisible = (val) => {
        this.setState({
            showEditMessageModal: val,
        })
    }

    handleUserThreadModal = (which) => {
        this.setState({
            showUserThreadModal: which
        });
    }

    toggleMessagesList = () => {
        this.props.clearThreadId()
        this.props.history.push(`${this.props.webappUrl}messageslist/`)
    }

    toggleMessageDetails = () => {
        if (this.props.webappUrl === '/solowebapp/') {
            alert('Bu işlemi yapabilmek için masaüstü versiyonunu kullanmalısınız');
            return;
        }
        this.setState(prevState => ({
            showMessageDetails: !prevState.showMessageDetails
        }));
    }

    getExcludes = (thread) => {
        if (thread) {
            return thread.members.map(member => parseInt(member.i_user, 10))
        }
        return []
    }

    notMe = (members) => { return members.filter(member => member.i_user !== this.props.userId) }
    render() {
        const { threadId, userId, searchValue, searchActive, matchedMessages, activeSearchedThreadId } = this.props;
        const { data: { loading, thread, refetch } } = this.props;
        return (loading) ? <LoadingIndicator /> : (
            <>
                <AddNewUserThreadModal threadId={threadId} show={this.state.showUserThreadModal} handleUserThreadModal={this.handleUserThreadModal} exclude={this.getExcludes(thread)} />
                <EditMesageModal
                    threadId={threadId}
                    visible={this.state.showEditMessageModal}
                    message={this.state.editMessage}
                    setVisible={this.setEditMessageModalVisible.bind(this)}
                />
                {
                    (!thread) ?
                        <SecondaryColumn style={{ height: '100%' }}>
                            <Result
                                status="warning"
                                title="BU IDye ait bir konuşma bulunamadı!"
                            />,
                        </SecondaryColumn>
                        :
                        <div style={{ display: 'flex', flexDirection: 'column' }}
                            className={this.props.headerExists ? 'headerExists' : null}>
                            <Toolbar
                                key="msglist"
                                leftItems={[
                                    <ShowOnMobile key="left">
                                        <SvgWrapper
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => { this.toggleMessagesList() }}
                                            key="leftmess"
                                        >
                                            <Icon glyph="view-back" />
                                        </SvgWrapper>
                                    </ShowOnMobile>,
                                    <SvgWrapper
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => { this.toggleMessageDetails() }}
                                        key="detailsmess"
                                    >
                                        <Icon glyph="info" />
                                    </SvgWrapper>
                                ]}
                                title={
                                    thread.isGroup ?
                                        thread.groupInfo.name :
                                        getMembers(thread.members, userId).length !== 0 ? getMembers(thread.members, userId).map(member => { return `${member.name} ${member.surname}` }).join(', ') : null
                                }
                                rightItems={[
                                    /*
                                    <ToolbarButton
                                        clickHandler={this.props.clickHandler}
                                        thread={thread}
                                        key="close" icon="ion-ios-close">
                                        <IoIosClose />
                                    </ToolbarButton>,
                                    */
                                    <ToolbarButton
                                        clickHandler={() => {alert('Yapım aşamasında!')}}
                                        key="phone" icon="ion-ios-call">
                                        <IoIosCall />
                                    </ToolbarButton>
                                ]}
                            />
                            {
                                (searchActive && searchValue.length >= 3 && activeSearchedThreadId === threadId && matchedMessages && matchedMessages.length > 0) &&
                                <MatchedMessages
                                    setMatchedMessageCurr={this.props.setMatchedMessageCurr.bind(this)}
                                    setMatchedMessages={this.props.setMatchedMessages.bind(this)}
                                    setSearchValue={this.props.setSearchValue.bind(this)}
                                    setSearchActive={this.props.setSearchActive.bind(this)}
                                    searchValue={searchValue}
                                    activeSearchedThreadId={activeSearchedThreadId}
                                    matchedMessages={matchedMessages}
                                    messIndex={this.state.messIndex}
                                    refetch={refetch}
                                    threadId={threadId}
                                    closeSearch={this.props.closeSearch.bind(this)}
                                    setMessIndex={(newIndex) => {
                                        this.setState({
                                            messIndex: newIndex,
                                        }, () => {
                                            console.log("setting current ID", newIndex)
                                            this.props.setMatchedMessageCurr(matchedMessages[newIndex])
                                            //matchedMessage: prevState.matchedMessages ? prevState.matchedMessages[newIndex] : []
                                        });
                                    }}
                                />

                            }
                            <MessagesContainer headerExists={this.props.headerExists} data-cy="messages-container">
                                <>
                                    {
                                        (this.state.showMessageDetails) ?
                                            <>
                                                <PrimarySecondaryColumnGrid
                                                    style={{
                                                        gridTemplateColumns: 'minmax(600px,968px) minmax(265px,400px)',
                                                        height: '100%',
                                                        maxHeight: '100vh',
                                                        overflow: 'hidden',
                                                        overflowY: 'hidden',
                                                    }}>
                                                    <PrimaryColumn fullWidth={true}>
                                                        <PerfectScrollbar
                                                            onYReachStart={() => {
                                                                console.log("x-reached");
                                                                //this.loadOlderMessages()
                                                            }}>
                                                            <ViewContent>
                                                                <MessagesScrollWrapper>
                                                                    <MessagesWrapper data-cy="message-group">
                                                                        <div className="message-list-container_">
                                                                            {
                                                                                getMessages(
                                                                                    thread,
                                                                                    userId,
                                                                                    this.props.matchedMessage,
                                                                                    this.setEditMessageModalVisible,
                                                                                    this.setEditMessageContent.bind(this),
                                                                                )
                                                                            }
                                                                            <div style={{ float: "left", clear: "both" }} ref={ref => this.end = ref} />
                                                                        </div>
                                                                    </MessagesWrapper>
                                                                </MessagesScrollWrapper>
                                                            </ViewContent>
                                                        </PerfectScrollbar>
                                                        <ChatInputWrapper>
                                                            <Compose
                                                                threadId={threadId}
                                                                thread={thread}
                                                                userId={userId}
                                                                rightItems={[
                                                                    <SendButton key={threadId} />,
                                                                ]} />
                                                        </ChatInputWrapper>
                                                    </PrimaryColumn >
                                                    <SecondaryColumn style={{ height: '100%' }}>
                                                        <MessageSidebar userId={userId} thread={thread} handleUserThreadModal={this.handleUserThreadModal} />
                                                    </SecondaryColumn>
                                                </PrimarySecondaryColumnGrid>
                                            </> :
                                            <>
                                                <PerfectScrollbar
                                                    onScrollY={container => {
                                                        // when reached top scroll more
                                                        if (container.scrollTop < 7) {
                                                            this.loadOlderMessages()
                                                        }
                                                    }}
                                                >
                                                    <ViewContent>
                                                        <MessagesScrollWrapper>
                                                            <MessagesWrapper data-cy="message-group">
                                                                <div id="rx-main-messages" className="message-list-container_">
                                                                    {
                                                                        getMessages(
                                                                            thread,
                                                                            userId,
                                                                            this.props.matchedMessage,
                                                                            this.setEditMessageModalVisible,
                                                                            this.setEditMessageContent.bind(this))
                                                                    }
                                                                    <div style={{ float: "left", clear: "both" }} ref={ref => this.end = ref} />
                                                                </div>
                                                            </MessagesWrapper>
                                                        </MessagesScrollWrapper>
                                                    </ViewContent>
                                                </PerfectScrollbar>
                                                <ChatInputWrapper>
                                                    <Compose
                                                        threadId={threadId}
                                                        thread={thread}
                                                        userId={userId}
                                                        rightItems={[
                                                            <SendButton key={threadId} />,
                                                        ]}
                                                    />
                                                </ChatInputWrapper>
                                            </>
                                    }
                                </>
                            </MessagesContainer>
                        </div>
                }
            </>

        )

    }

}


export default graphql(threadMessages, {
    options: props => ({
        fetchPolicy: (props.searchActive && props.searchValue.length >= 3 && props.activeSearchedThreadId === props.threadId) ? 'no-cache' : 'cache-first',
        variables: {
            threadId: props.threadId,
            searchedCursor: (props.searchValue.length >= 3 && props.activeSearchedThreadId === props.threadId) ? props.matchedMessage.id : undefined,
        },
    }),
})(MessageList)
