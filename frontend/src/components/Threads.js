
import React from 'react'
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { ThreadList } from './ThreadList'

const GET_THREADS = gql`
 {
    threads{
        _id
        members{
            user_id
            username
            lastSeen
            tenant
        }
    }
}
`;



export default class Threads extends React.Component {
  render() {
    return (
      <Query query={GET_THREADS}>
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;
          console.log("daata", data)
          const { user, onSignOut } = this.props;

          return <ThreadList threads={data.threads} user={user}></ThreadList>

        }}
      </Query>
    )
  }
}