import React from 'react';
// import whyDidYouRender from '@welldone-software/why-did-you-render';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

// TODO: find better way to import configs -umut
import appType from './getAppType';
import { createUploadLink } from 'apollo-upload-client'

import ReactNotification from 'react-notifications-component';
import SipProvider from './components/SipProvider';
import VisibilityProvider from './visibility';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { withClientState } from 'apollo-link-state';
import { WebSocketLink } from 'apollo-link-ws'
import { onError } from "apollo-link-error";
import { getMainDefinition } from 'apollo-utilities'
import { ThemeProvider } from 'styled-components';
import { theme } from './shared/theme'
import AppViewWrapper from './components/appViewWrapper'
import Navigation from './views/navigation';
import GlobalStyles from './reset.css';

import { Result, Button } from 'antd';


import { Login } from './components/Login';
import Mobichat from './components/Mobichat';
import Mobicall from './components/Mobicall';
import MultipleTabs from './components/multipleTabs';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-notifications-component/dist/theme.css'
import { FullScreenCallWidget } from './components/FullScreenCallWidget';
// import { registerServiceWorker } from "./register-sw";
// import { messaging } from './firebase.js'
import { NavigationContext } from './lib/navigation-context';
import AuthRoute from './components/AuthRouteHoc';
import ErrorRoute from './components/ErrorRouteHoc';
import compose from 'recompose/compose';
import { split, from } from 'apollo-link'
import getReducer from './reducers'
import { createLogger } from 'redux-logger'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

// import registerServiceWorker from './registerServiceWorker';
// import browser from 'webextension-polyfill';

// import Extension from './components/Extension';
// import EContext from './lib/context';

import './index.css';


const store = createStore(getReducer(),
applyMiddleware(
  thunkMiddleware, // lets us dispatch() functions
)

)

// import App from './App';
// import * as serviceWorker from './serviceWorker';

const { GQ_URL, WS_URL, LOGIN_URL, TENANT_ROOT } = appType.config;


const httpLink = createUploadLink({ uri: GQ_URL, credentials: 'include' });


const wsLink = new WebSocketLink({
  uri: WS_URL,
  options: {
    reconnect: true,
    credentials: 'include',
  }
})

const appCache = new InMemoryCache({
  dataIdFromObject: object => {
    return object._id
  },
})

const stateLink = withClientState({
  cache: appCache,
  resolvers: {},
  // set default state, else you'll get errors when trying to access undefined state
  defaults: {
    authStatus: {
      __typename: 'authStatus',
      status: 'loggedOut'
    },
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  console.log("network", networkError, "gqer", graphQLErrors)
  if (networkError) {
    localStorage.removeItem('user');
    appCache.writeData({
      data: {
        authStatus: {
          __typename: 'authStatus',
          status: 'loggedOut',
        },
      },
    });

  }
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) => {
      console.log("error messages", message)
      if (message === "Unauthorized") {
        // every 401/unauthorized error will be caught here and update the global local state
        localStorage.removeItem('user');
        appCache.writeData({
          data: {
            authStatus: {
              __typename: 'authStatus',
              status: 'loggedOut',
            },
          },
        }); 

      } else if (message === "Topology was destroyed") {
        appCache.writeData({
          data: {
            gqError: {
              __typename: 'gqError',
              message: `Server Hatası Lütfen Bize Ulaşın! ${message}`,
            },
          },
        });
      }
    });
  }
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)


const client = new ApolloClient({
  connectToDevTools: true,
  link: from([
    stateLink,
    errorLink,
    link,
  ]),
  cache: appCache,
  clientState: { defaults: {}, resolvers: {} }
})

// whyDidYouRender(React)

let localStorageTimeout = 15 * 1000; // 15,000 milliseconds = 15 seconds.
let localStorageResetInterval = 10 * 1000; // 10,000 milliseconds = 10 seconds.
let localStorageTabKey = 'test-application-browser-tab';
let sessionStorageGuidKey = 'browser-tab-guid';

function createGUID() {
  let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    /*eslint-disable*/
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    /*eslint-enable*/
    return v.toString(16);
  });

  return guid;
}
function testTab() {
  let sessionGuid = sessionStorage.getItem(sessionStorageGuidKey) || createGUID();
  let tabObj = JSON.parse(localStorage.getItem(localStorageTabKey)) || null;

  sessionStorage.setItem(sessionStorageGuidKey, sessionGuid);

  // If no or stale tab object, our session is the winner.  If the guid matches, ours is still the winner
  if (tabObj === null || (tabObj.timestamp < new Date().getTime() - localStorageTimeout) || tabObj.guid === sessionGuid) {
    function setTabObj() {
      let newTabObj = {
        guid: sessionGuid,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(localStorageTabKey, JSON.stringify(newTabObj));
    }
    setTabObj();
    setInterval(setTabObj, localStorageResetInterval);
    return true;
  } else {
    // An active tab is already open that does not match our session guid.
    return false;
  }
}

class Settings extends React.Component {
  componentDidMount() {
    console.log("settings mounted")
  }
  render() {
    return (
      <div
        style={{
          padding: '20px',
        }}
      > Settings </div>
    )
  }
}



class Main extends React.PureComponent {

  constructor(props) {
    super(props)
    // the initial application state
    this.state = {
      user: null,
      // fetched_ids: false,
      fetched_ids: true,
      sessionids: [],
      session_ok: null, // if we found the session and didnt validate
      headerExists: true,
      headerSize: '56', // without px set 0 for mobile
      notifyChat: false,
      navigationIsOpen: false,
      // TODO search can be done from its component
      // fix it later @ umut
      searchActive: false,
      searchValue: "",
    }
    // TODO move to context provider maybe? @umut
    // did not changed other webapp urls because
    // solowebapp does not have navigation or call
    // set solowebapp for mobile
    this.webappUrl = '/webapp/';
  }

  // App "actions" (functions that modify state)
  signIn = async (response) => {
    console.log("resp", response)
    localStorage.setItem('user', JSON.stringify(response));
    this.setState({
      user: response
    });
  }

  clearSearchValues = () => {
    this.setState({
      searchValue: "",
      searchActive: false,
    })
  }

  setNavigationOpen(val) {
    this.setState({ navigationIsOpen: val })
  }

  setSearchActive = (setValue) => {
    this.setState({
      searchActive: setValue
    })
  }

  setSearchValue = (searchValue) => {
    console.log("setting search vlalue", searchValue, "is emptyniess", searchValue === "")
    this.setState({
      searchValue
    })
  }

  onSessionFail() {
    this.setState({
      session_ok: false
    })
  }

  signOut() {
    // clear out user from state
    this.setState({ user: null })
  }

  setCookies() {
    /* eslint-disable no-undef */
    const ids = [];
    if (chrome && chrome.extension) {
      browser.cookies.getAll({ domain: 'mobikob.com', name: 'sessionid' }).then(cookies => {
        if (cookies)
          cookies.forEach(cookie => {
            const tenant = cookie.domain.split('.')[0];
            if (tenant !== "850")
              ids.push({ tenant: tenant, sessionid: cookie.value })
          })
        this.setState(state => { return { fetched_ids: true, sessionids: ids } });
      });
      console.log("this is coookies", ids);
    } else {
      console.log("this is not a extension")
      ids.push(null);
    }
    /* eslint-enable no-undef */

  }

  // https://jossmac.github.io/react-toast-notifications/
  componentDidUpdate(prevProps, prevState) {
    console.log("index updated")

  }

  async componentDidMount() {

    console.log("index mounted")

    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser) {
      this.signIn(localUser);
    }
    // // this.setCookies()
    /*
        messaging.requestPermission()
          .then(async function() {
          const token = await messaging.getToken();
          })
          .catch(function(err) {
          console.log("Unable to get permission to notify.", err);
          });
        navigator.serviceWorker.addEventListener("message", (message) => console.log(message));
    */
    /*
     navigator.serviceWorker.addEventListener('message', (event) => {
       // do some work here
       console.log("click notification for ", event)
       if (event.data === "new_message_action") {
           newMessageRing.play();
       }
 
     });
     */


  }
  updateChat = (state) => { console.log("changing nofyt to", state); this.setState({ notifyChat: !state }) }


  render() {
    const current_app = sessionStorage.getItem("current_app");
    if (this.webappUrl !== '/solowebapp/' && !testTab()) {
      return (
        <MultipleTabs />
      )
    }
    if (this.props.errorData.gqError && this.props.errorData.gqError.message) {
      return (
        <Result
          status="500"
          title="500"
          subTitle={this.props.errorData.gqError.message}
          extra={<Button onClick={() => { window.location.reload() }} type="primary">Sayfayı Yenile</Button>}
        />
      )
    }
    if (this.props.data.authStatus.status === "loggedIn") {
      if (current_app === this.state.user.i_user.toString()) {
        console.log("shouldddvee close");
      }
      console.log("render found user")
      return (
        <>
          <AppViewWrapper
            headerExists={this.state.headerExists}
            headerSize={this.state.headerSize}
          >
            <SipProvider user={this.state.user}>
              <Navigation
                headerExists={this.state.headerExists}
                headerSize={this.state.headerSize}
                navigationIsOpen={this.state.navigationIsOpen}
                setNavigationOpen={this.setNavigationOpen.bind(this)}
              // notifyChat={this.state.notifyChat}
              // readChat={this.updateChat}
              ></Navigation>
              <Switch>
                <Route path={this.webappUrl + `messages/:messId?`}
                  exact
                  render={(props) =>
                    <Mobichat
                      {...props}
                      client={client}
                      headerExists={this.state.headerExists}
                      headerSize={this.state.headerSize}
                      navigationIsOpen={this.state.navigationIsOpen}
                      setNavigationOpen={this.setNavigationOpen.bind(this)}
                      user={this.state.user}
                      justConvos={false}
                      onSignOut={this.signOut.bind(this)}
                      searchActive={this.state.searchActive}
                      searchValue={this.state.searchValue}
                      setSearchValue={this.setSearchValue.bind(this)}
                      setSearchActive={this.setSearchActive.bind(this)}
                      clearSearchValues={this.clearSearchValues.bind(this)}
                      webappUrl={this.webappUrl}

                    />
                  }
                />
                <Route path={this.webappUrl + `messageslist/`}
                  exact
                  render={(props) =>
                    <Mobichat
                      {...props}
                      client={client}
                      headerExists={this.state.headerExists}
                      headerSize={this.state.headerSize}
                      user={this.state.user}
                      justConvos={true}
                      onSignOut={this.signOut.bind(this)}
                      navigationIsOpen={this.state.navigationIsOpen}
                      setNavigationOpen={this.setNavigationOpen.bind(this)}
                      searchActive={this.state.searchActive}
                      searchValue={this.state.searchValue}
                      setSearchValue={this.setSearchValue.bind(this)}
                      setSearchActive={this.setSearchActive.bind(this)}
                      clearSearchValues={this.clearSearchValues.bind(this)}
                      webappUrl={this.webappUrl}

                    />
                  }
                />
                <Route path={this.webappUrl + "settings"} exact component={Settings} />
                <Route path={this.webappUrl + "calls/"}
                  render={(props) => <Mobicall {...props} user={this.state.user} headerExists={this.state.headerExists} headerSize={this.state.headerSize} />}
                />
                <Route path={this.webappUrl + "activecalls/:callId"} exact
                  render={(props) => <FullScreenCallWidget {...props} user={this.state.user} headerExists={this.state.headerExists} headerSize={this.state.headerSize} />}
                />
                <Redirect exact from="/" to={this.webappUrl + "messages"} />
                <Redirect exact from={this.webappUrl} to={this.webappUrl + "messages"} />
              </Switch>
              <ReactNotification
                types={[
                  {
                    htmlClasses: ['notification-awesome'],
                    name: 'awesome'
                  }
                ]}
                isMobile={false}
              />

            </SipProvider>
          </AppViewWrapper>
        </>
      )
    } else {
      return (
        <Login
          onSignIn={this.signIn.bind(this)}
          onFail={this.onSessionFail.bind(this)}
          LOGIN_URL={LOGIN_URL}
        />
      )
    }
    // add
  }
}
const WrappedMain = compose(ErrorRoute, AuthRoute)(Main);

const App = (
  <Provider store={store}>
    <ApolloProvider client={client}>
      <VisibilityProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Router>
            <WrappedMain tenantRoot={TENANT_ROOT} />
          </Router>
        </ThemeProvider>
      </VisibilityProvider>
    </ApolloProvider>
  </Provider>
);
/*
</SipProvider>
*/

//registerServiceWorker();

ReactDOM.render(App, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
