import React from 'react';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import ConversationList from '../ConversationList';
import MessageList from '../MessageList';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewThreadModal from '../NewThreadModal';
// TODO: import from same library
import EContext from '../../lib/context';
import { NavigationContext } from '../../lib/navigation-context';
import { IoIosAddCircleOutline } from "react-icons/io";
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar'
// disable messaging for mobile app webview wont support firebase notif
import { messaging } from '../../firebase';
import InCallWidget from '../InCallWidget';
import FileUpload from '../FileUpload';
import axios from 'axios';
import appType from '../../getAppType';
import VisibilityContext from '../../lib/visibility_context';
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {
    ViewGrid,
    SecondaryPrimaryColumnGrid,
    PrimaryColumn,
    SecondaryColumn,
} from '../layout';
import './Mobichat.css';

const { FB_URL } = appType.config;


const SET_LASTSEEN = gql`
    mutation($userId: String!, $threadId: String!) {
         updateUserLastSeen(input: {userId: $userId, threadId: $threadId}) {
            _id
        }
    }
`;

export default class Mobichat extends React.Component {
    //static whyDidYouRender = true
    constructor(props) {
        super(props);
        this.state = {
            showWindow: false,
            threadModalShow: false,
            navigationOpen: false,
            threadId: "",
            threadUnseens: [],
            matchedMessages: [],
            activeSearchedThreadId: "",
            matchedMessage: {}
        }
    }

    closeSearch = () => {
        this.setState({
            activeSearchedThreadId: "",
            matchedMessage: {},
            matchedMessages: [],
        })
    }

    setMatchedMessages = (matchedMessages) => {
        this.setState({
            matchedMessages
        })
    }

    setMatchedMessageCurr = (matchedMessage) => {
        this.setState({
            matchedMessage
        })
    }

    setActiveSearchedThreadId = (activeSearchedThreadId) => {
        this.setState({
            activeSearchedThreadId
        })
    }


    static getDerivedStateFromProps(props, state) {
        const { messId } = props.match.params;
        if (messId)
            return {
                threadId: messId,
                showWindow: true,
            };
        return null;
    }


    async componentDidMount() {
        const grantedPerm = await this.notificationPermission();
        if (!grantedPerm) {
            /*
            store.addNotification({
                title: 'Bildirimler Açılamadı!',
                message: 'Mesajlarınızı kaçırmamak için lütfen bildirimleri açın.',
                type: 'warning',                         // 'default', 'success', 'info', 'warning'
                container: 'bottom-right',                // where to position the notifications
                animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
                animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
                dismiss: {
                    duration: 3000,
                    showIcon: true,
                }
              })
              */
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.searchActive && !this.props.searchActive) {
            this.setState({
                matchedMessage: {},
                matchedMessages: [],
            })
            return;
        }
        if (prevProps.searchValue.length >= 3 && this.props.searchValue.length === "") {
            this.setState({
                matchedMessage: {},
                matchedMessages: [],
            })
        }
    }

    sendTokenToDb = async (token) => {
        try {
            axios.defaults.withCredentials = true
            await axios.post(`${FB_URL}/storetoken`, { token });
        } catch (error) {
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error: ', error.message);
            }
        }
    }

    notificationPermission = async () => {
        console.log("requesting permisson");
        let permissionGranted = false;
        // Disable this block on solo app build
        try {
            // request permission if not granted 
            if (Notification.permission !== 'granted') {
                await messaging.requestPermission();
            }
            // get instance token if not available 
            const token = await messaging.getToken(); // returns the same token on every invocation until refreshed by browser
            await this.sendTokenToDb(token);
            console.log("tooken", token);
            permissionGranted = true;
        } catch (err) {
            console.log(err);
            if (err.hasOwnProperty('code') && err.code === 'messaging/permission-default') console.log('You need to allow the site to send notifications');
            else if (err.hasOwnProperty('code') && err.code === 'messaging/permission-blocked') console.log('Currently, the site is blocked from sending notifications. Please unblock the same in your browser settings');
            else if (err.hasOwnProperty('code') && err.code === 'messaging/token-unsubscribe-failed') {
                console.log('the stupid fcm error. calling itself!. https://github.com/firebase/firebase-js-sdk/issues/2364');
                this.notificationPermission();
            }
            else console.log('Unable to subscribe you to notifications');
        } finally {
            return permissionGranted;
        }
    }

    clearThreadId = (event) => {
        this.setState({
            threadId: ""
        })

    }

    onConversationClick = (event, thread) => {
        this.setState(function (state) {
            let showWindow = !state.showWindow;
            console.log("thread", state.threadId, "curr", thread._id, "onConvo", this.props.searchActive, this.props.searchValue)
            let activeSearchedThreadId = "";
            if (this.props.searchActive && this.props.searchValue.length >= 3) {
                activeSearchedThreadId = thread._id
                //this.props.setActiveSearchedThreadId(thread._id)
            }
            console.log("active searchid", activeSearchedThreadId)
            // if the url has solowebapp open the same thread anyways
            if (state.threadId !== thread._id || this.props.webappUrl === '/solowebapp/') {
                // keep window open when changin between threads
                // if the user click same thread twice close
                showWindow = true;
                this.props.history.push(`${this.props.webappUrl}messages/${thread._id}`)
            } else {
                // same thread 
                console.log("same thread wont open")
                return {
                    activeSearchedThreadId,
                    threadUnseens: state.threadUnseens.filter(threadId => threadId !== thread._id),
                };
            }
            return {
                showWindow,
                threadId: thread._id,
                activeSearchedThreadId,
                threadUnseens: state.threadUnseens.filter(threadId => threadId !== thread._id),
            }
        })
    }

    onNewThreadMessage = (threadId) => {
        this.setState({
            threadUnseens: [
                ...this.state.threadUnseens, threadId
            ]
        })
    }
    /* solo app delete left items of toolbar"
                                            leftItems={[
                                        <ShowOnMobile key="woho">
                                            <SvgWrapper
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => { this.props.setNavigationOpen(!this.props.navigationIsOpen) }}
                                                key="menuchat"
                                            >
                                                <Icon glyph="menu" />
                                            </SvgWrapper>
                                        </ShowOnMobile>
                                    ]}
                                    */
    render() {
        const { user } = this.props;

        return (
            <div className="messenger_">
                <NewThreadModal user={user} show={this.state.threadModalShow} onHide={() => this.setState({ threadModalShow: false })} />
                <ViewGrid
                    headerExists={this.props.headerExists}
                    headerSize={this.props.headerSize}
                >
                    <SecondaryPrimaryColumnGrid fullWidth={true} colGap={'10'}>
                        <SecondaryColumn
                            headerExists={this.props.headerExists}
                            headerSize={this.props.headerSize}
                            justConvos={this.props.justConvos}
                        >
                            <div className="scrollable_ sidebar_">
                                <InCallWidget />
                                <Toolbar
                                    title="Mobichat"
                                    rightItems={[
                                        <ToolbarButton key="addchatt" clickHandler={() => this.setState({ threadModalShow: true })}>
                                            <IoIosAddCircleOutline />
                                        </ToolbarButton>
                                    ]}
                                />
                                <EContext.Consumer>
                                    {econtext =>
                                        <PerfectScrollbar suppressScrollX style={{
                                            maxHeight: "calc(100vh - 60px)",
                                            height: "calc(100vh - 60px)",
                                        }}>
                                            <Mutation mutation={SET_LASTSEEN} >
                                                {
                                                    postMutation =>
                                                        <ConversationList
                                                            {...this.props}
                                                            user={user}
                                                            threadId={this.state.threadId}
                                                            limit={20}
                                                            threadUnseens={this.state.threadUnseens}
                                                            onNewThreadMessage={this.onNewThreadMessage}
                                                            clickHandler={(event, thread) => {
                                                                console.log("event", event, "thread", thread, "user", user);
                                                                if (Object.keys(user).includes("i_user") && thread._id) {
                                                                    const threadUnseens = this.state.threadUnseens.filter(threadId => threadId !== thread._id)
                                                                    this.setState({
                                                                        threadUnseens
                                                                    })
                                                                    postMutation({
                                                                        variables: {
                                                                            userId: user.i_user.toString(),
                                                                            threadId: thread._id,
                                                                        }
                                                                    });
                                                                    this.onConversationClick(event, thread);
                                                                }
                                                            }}
                                                            setUserLastSeen={postMutation}
                                                            econtext={econtext}
                                                            setMatchedMessages={this.setMatchedMessages.bind(this)}
                                                            setMatchedMessage={this.setMatchedMessageCurr.bind(this)}
                                                            searchValue={this.props.searchValue}
                                                            searchActive={this.props.searchActive}
                                                            setSearchValue={this.props.setSearchValue.bind(this)}
                                                            setSearchActive={this.props.setSearchActive.bind(this)}
                                                            webappUrl={this.props.webappUrl}
                                                        />
                                                }
                                            </Mutation>
                                        </PerfectScrollbar>
                                    }
                                </EContext.Consumer>
                            </div>
                        </SecondaryColumn>
                        <PrimaryColumn fullWidth={true}>
                            {(!this.props.justConvos && this.state.showWindow) &&
                                <Mutation mutation={SET_LASTSEEN} variables={{ userId: user.i_user.toString(), threadId: this.state.threadId }}>
                                    {
                                        postMutation =>
                                            <VisibilityContext.Consumer>
                                                {
                                                    visibility =>
                                                        <FileUpload threadId={this.state.threadId}>
                                                            <MessageList {...this.props}
                                                                headerExists={this.props.headerExists}
                                                                key={this.state.threadId}
                                                                threadUnseens={this.state.threadUnseens}
                                                                onNewThreadMessage={this.onNewThreadMessage}
                                                                clickHandler={this.onConversationClick}
                                                                clearThreadId={this.clearThreadId}
                                                                threadId={this.state.threadId}
                                                                userId={user.i_user}
                                                                visibility={visibility}

                                                                closeSearch={this.closeSearch.bind(this)}
                                                                setUserLastSeen={postMutation}
                                                                matchedMessage={this.state.matchedMessage}
                                                                matchedMessages={this.state.matchedMessages}
                                                                activeSearchedThreadId={this.state.activeSearchedThreadId}
                                                                searchValue={this.props.searchValue}
                                                                setMatchedMessages={this.setMatchedMessages.bind(this)}
                                                                setMatchedMessageCurr={this.setMatchedMessageCurr.bind(this)}
                                                                setSearchValue={this.props.setSearchValue.bind(this)}
                                                                setSearchActive={this.props.setSearchActive.bind(this)}
                                                                webappUrl={this.props.webappUrl}
                                                            />
                                                        </FileUpload>
                                                }
                                            </VisibilityContext.Consumer>
                                    }
                                </Mutation>
                            }
                        </PrimaryColumn>

                    </SecondaryPrimaryColumnGrid>
                </ViewGrid>

            </div>
        )

    }

}
