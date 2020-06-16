/*global chrome*/
import React from 'react';
import { Button, Input, Container, Header } from 'semantic-ui-react';
import axios from 'axios';

export default class ClassicLogin extends React.Component {
    state = {
        username: 'gokhan@sahratelekom.com',
        password: 'qaz123',
        tenant: 'sahra',
        dname: 'mobikob',
    }

    onChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        })
    }

    onSubmit = async () => {
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.withCredentials = true;
        axios.post(this.props.LOGIN_URL, this.state).then(response => {
            console.log(response);
            this.props.onSignIn(response.data)
        }).catch(error => {
            console.log("rerr", error);
        })
    }
    componentDidMount() {
        
    }

    render() {
        const { username, password, tenant, dname } = this.state;

        return (
            <Container text>
                <Header as="h2">Login</Header>
                <Input
                    value={username}
                    onChange={this.onChange}
                    type="text"
                    name="username"
                    placeholder="Your username address"
                    fluid
                />
                <Input
                    value={password}
                    onChange={this.onChange}
                    type="text"
                    name="password"
                    placeholder="password"
                    fluid
                />
                <Input
                    value={tenant}
                    onChange={this.onChange}
                    type="text"
                    name="tenant"
                    placeholder="tenant"
                    fluid
                />
                <Input
                    value={dname}
                    onChange={this.onChange}
                    type="text"
                    name="dname"
                    placeholder="dname"
                    fluid
                />
                <Button onClick={this.onSubmit}>Submit</Button>

            </Container>

        )
    }
}