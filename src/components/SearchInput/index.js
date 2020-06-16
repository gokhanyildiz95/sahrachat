import React from 'react';
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag';

const userList = gql`
query($queryString: String!) {
    searchUsers(queryString: $queryString){
        i_user
        name
        surname
        username
    }
}
`;

class SearchInput extends React.Component {

    handleChange = (e) => {
        const value = e.target.value;
        this.props.onChange(e)
        this.props.setLoading(true);
        this._executeSearch(value);
    }

    _executeSearch = async (value) => {
        // const { value } = this.state;
        console.log("value", value)
        if ( value !== '') {
            const result = await this.props.client.query({
                query: userList,
                variables: {queryString: value},
            })
            console.log("execute search res", result)
            const users = result.data.searchUsers;
            this.props.setUsers(users);
            this.props.setLoading(false);
        } else {
            this.props.setUsers([]);
            this.props.setLoading(false);
        }
    }

    render() {
        return (
            <input
                onChange={this.handleChange}
                value={this.props.value}
                placeholder="Kullanıcı ara..."
                className="compose-input"
                type="text" />
        )
    }
}

export default withApollo(SearchInput)
