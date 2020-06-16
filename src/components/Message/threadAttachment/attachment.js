import React from 'react';
import { Link } from 'react-router-dom';
// import { Loading } from 'src/components/loading';
import { Container, LinkWrapper, AvatarWrapper, Column } from './style';
// import Activity from 'src/components/inboxThread/activity';
// import { ThreadTitle } from 'src/components/inboxThread/style';
// import { UserAvatar } from 'src/components/avatar';

class Attachment extends React.Component {
  render() {
    const { data, currentUser, id } = this.props;
    const { thread, loading, error } = data;

    if (loading)
      return (
        <div className="attachment-container">
          <Container style={{ padding: '16px 12px' }}>
            <div> loading </div>
          </Container>
        </div>
      );

    if (error || !thread)
      return (
        <Link to={`/thread/${id}`}></Link>
      );

    return (
      <div className="attachment-container">
        <Container data-cy="thread-attachment">
          <LinkWrapper
            onClick={e => e.stopPropagation()}
          />
          <AvatarWrapper>
            <div user={thread.author.user} size={32} > </div>
          </AvatarWrapper>
          <Column>
            <div>{thread.content.title}</div>
            <div
              currentUser={currentUser}
              thread={thread}
              active={false}
            ></div>
          </Column>
        </Container>
      </div>
    );
  }
}

export default Attachment;
// to={{ pathname: getThreadLink(thread), state: { modal: true } }}