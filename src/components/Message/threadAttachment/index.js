import React from 'react';
/*
import {
  getThreadById,
  GetThreadType,
} from 'shared/graphql/queries/thread/getThread';
*/
// import { MessageInfoType } from 'shared/graphql/fragments/message/messageInfo.js';
//import { UserInfoType } from 'shared/graphql/fragments/user/userInfo.js';
import Attachment from './attachment';

// const getThreadById = gql`
// `;


const Query = ({ data, message, id, ...rest }) => (
  <Attachment message={message} id={id} data={data} />
);

//const ThreadAttachment = compose(getThreadById)(Query);
const ThreadAttachment = Query;

export default ThreadAttachment;