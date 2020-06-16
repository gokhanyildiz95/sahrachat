import React from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

const LoadingIndicator = (props) => {
    return (
        <Spinner animation="border" role="status">
            <span className="sr-only">{props.text}</span>
        </Spinner>
    )
}

export default class TenantLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: "Yükleniyor...", tries: 1};
    }
    logIn = async () => {
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.headers.common['X-Forwarded-Host'] = window.location.host;
        axios.defaults.withCredentials = true;
        axios.post(this.props.LOGIN_URL).then(response => {
            console.log(response);
            this.props.onSignIn(response.data)
        }).catch(error => {
            this.setState({
                text: "Yüklenirken hata!",
                tries: this.state.tries + 1
            })
            if (this.state.tries < 10)
                this.logIn();
            console.log("rerr", error);
        })
    }
    componentDidMount() {
        this.logIn();
    }
    render () {
        return (
            <LoadingIndicator text={this.state.text} />
        )
    }
}