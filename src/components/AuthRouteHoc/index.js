
import gql from 'graphql-tag';
import * as React from 'react';
import { graphql } from 'react-apollo';
import compose from 'recompose/compose';
import { Redirect } from 'react-router-dom';

const AuthRoute = () => (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const { data } = this.props
      console.log("auth route data", data)
      return <WrappedComponent {...this.props} />;
    }
  };
}

const GET_AUTH = gql`
query authStatus {
  authStatus @client {
    status
  }
}
`;

export default compose(graphql(GET_AUTH), AuthRoute());