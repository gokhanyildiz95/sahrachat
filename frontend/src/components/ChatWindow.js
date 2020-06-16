import React from 'react'
import gql from "graphql-tag";
import { Query } from "react-apollo";

const GET_THREADS = gql`
 {
    me{
        username
    }
}
`;

export default class ChatWindow extends React.Component {
    render() {
        return(
            <Query query={GET_THREADS}>

            {({ loading, error, data }) => {
                if (loading) return "Loading...";
                if (error) return `Error! ${error.message}`;

                return (
                    <h1>check to consle</h1>
                );
            }}

            </Query>
        )
    }
}