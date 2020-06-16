import React from 'react';
import SessionLogin from './SessionLogin';
import TenantLogin from './TenantLogin';
import ClassicLogin from './ClassicLogin';
import { useApolloClient } from "@apollo/react-hooks";

// determines which auth method to use
export const Login = (props) => {
    const { onSignIn, onFail, LOGIN_URL } = props;
    const client = useApolloClient();

    const setLoggedIn = () => {
        client.writeData({
            data: {
              authStatus: {
                __typename: 'authStatus',
                status: 'loggedIn',
              },
            },
          });
    }

    const localSignIn = (data) => {
        // TODO use user data in local state?
        console.log("local sign in data", data)
        onSignIn(data);
        setLoggedIn();
    }
    if (window.location.host.split('.').length === 3) {
        console.info("Auth using TenantLogin");
        return (
            <TenantLogin
                LOGIN_URL={LOGIN_URL}
                onSignIn={localSignIn}
            />
        )
    } else {
        console.info("Auth using ClassicLogin");
        return (
            <ClassicLogin
                onSignIn={localSignIn}
                LOGIN_URL={LOGIN_URL}
            />
        )
    }

}

/*
export default class Login extends React.Component {
    constructor(props) {
        super(props)
        // the initial application state
        this.state = {
            // fetched_ids: false,
            fetched_ids: true,
            sessionids: [],
            session_ok: null, // if we found the session and didnt validate
        }
    }
    async componentDidMount() {
        // this.setCookies()
    }
    setCookies() {
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

    }

    render() {
        const { onSignIn, onFail, LOGIN_URL } = this.props;
        if (window.location.host.split('.').length === 3) {
            console.info("Auth using TenantLogin");
            return (
                <TenantLogin
                    LOGIN_URL={LOGIN_URL}
                    onSignIn={onSignIn.bind(this)}
                />
            )
        } else {
            // wait for fetching ids
            if (!this.state.fetched_ids) {
                return (
                    <div> Uygulama Açılıyor.. </div>
                )
            }
            // when ids updated check if we found session
            else if (this.state.fetched_ids && this.state.sessionids.length > 0) {
                console.info("Auth using SessionLogin");
                return (
                    <SessionLogin
                        onSignIn={onSignIn.bind(this)}
                        onFail={onFail.bind(this)}
                        sessionids={this.state.sessionids}
                        LOGIN_URL={LOGIN_URL}
                    />
                )
            } else if (!this.state.session_ok) {
                console.info("Auth using ClassicLogin");
                return (
                    <ClassicLogin
                        onSignIn={onSignIn.bind(this)}
                        LOGIN_URL={LOGIN_URL}
                    />
                )
            }
        }

    }
}
*/