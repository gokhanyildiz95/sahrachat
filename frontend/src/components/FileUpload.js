import React from 'react';
import {useDropzone} from 'react-dropzone';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { messageTypeObj } from '../shared/draft-utils/process-message-content';
import DropzoneContext from '../shared/dropzone_context';

const getColor = (props) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isDragActive) {
      return '#2196f3';
  }
  return '#ffffff00';
}

const Container = styled.div`
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  transition: border .24s ease-in-out;
`;
const uploadFileMessageMutation = gql`
  mutation($threadId: String!, $messageType: MessageTypes!, $file: Upload) {
    
        addMessage(message: {threadId: $threadId, messageType: $messageType, file: $file}) {
          id
          content 
          messageType
          parent {
              id
          }
          modifiedAt
          createdAt
          user {
              i_user
              username
          }
      }
  }
`;

const FileUpload = ({ children, threadId, mutate }) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    minSize: 0,
    maxSize: 15242880,
    onDrop: async ([file]) => {
      console.log("fillee", file)
      const messageType = messageTypeObj.file;
      const response = await mutate({variables: {
        messageType,
        threadId,
        file,
      }});
      console.log("resp", response)
    }
  });
  
  return (
    <div className="containerx">
      <Container {...getRootProps({isDragActive, isDragAccept, isDragReject})} data-cy={"container-dropzone"}>
        <input {...getInputProps()} />
        <DropzoneContext.Provider value={{
          open
        }}>
          {children}
        </DropzoneContext.Provider>
      </Container>
    </div>
  );
}
export default graphql(uploadFileMessageMutation)(FileUpload);
