import React from 'react';
import axios from 'axios';

export default class SesssionLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: "Yükleniyor..."};
    }
    logIn = async () => {
        const {sessionids} = this.props;
        let session = null;
        if (sessionids.length > 1) {
            session = sessionids.filter(session => session.tenant === "sahra")[0]
        } else {
            session = sessionids[0];
        }
        console.log("sessionids", sessionids, "session", session);
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['X-Forwarded-Host'] = `${session.tenant}.mobikob.com`;
        axios.defaults.headers.common['X-Session-ID'] = session.sessionid;
        axios.defaults.withCredentials = true;
        axios.post(this.props.LOGIN_URL).then(response => {
            console.log(response);
            if ("error" in response.data) {
                this.props.onFail();
            }
            this.props.onSignIn(response.data)
        }).catch(error => {
            this.props.onFail();
            this.setState({
                text: "Yüklenirken hata!",
            })
        });
    }

    componentDidMount(){
        this.logIn();
    }

    render () {
        const avAccounts = this.props.sessionids.map((session) => <li key={session.tenant}>{session.tenant}-{session.sessionid}</li>);
        return (
            <div>
                <h5>{this.state.text}</h5>
                <h4> Mevcut mobikob hesapları </h4>
                {avAccounts}
            </div>
        )
    }
}