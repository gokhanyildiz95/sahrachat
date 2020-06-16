
import gql from 'graphql-tag';
import * as React from 'react';
import { graphql } from 'react-apollo';
import compose from 'recompose/compose';
import { Redirect } from 'react-router-dom';

const ErrorRoute = () => (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const { data } = this.props
      console.log("error route data", data)
      return <WrappedComponent {...this.props} errorData={data} />;
    }
  };
}

const GET_ERROR = gql`
query gqError {
  gqError @client {
    message
  }
}
`;

export default compose(graphql(GET_ERROR), ErrorRoute());