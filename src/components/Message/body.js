import React from 'react';
import redraft from 'redraft';

import Icon, { SvgWrapper } from '../icon';

import {
    Text,
    Emoji,
    Image,
    QuoteWrapper,
    QuoteWrapperGradient,
    QuotedParagraph,
} from './style';
import { messageRenderer } from '../../draft-js/message/renderer';
import { Byline, Name, Username } from './style';
import { messageTypeObj } from '../../shared/draft-utils/message-types';
import { isShort } from '../../draft-js/utils/isShort';
import appType from '../../getAppType';
const { NODEJS_URL } = appType.config;

type BodyProps = {
    openGallery: Function,
    me: boolean,
    message: MessageInfoType,
    bubble?: boolean,
    showParent?: boolean,
    matched?: boolean,
};
// This regexp matches /community/channel/slug~id, /?thread=id, /?t=id etc.
// see https://regex101.com/r/aGamna/2/
export const Body = (props: BodyProps) => {
  const { showParent = true, message, openGallery, me, bubble = true, matched = false } = props;
  const emojiOnly = false;
  //  message.messageType === messageTypeObj.draftjs &&
  //  draftOnlyContainsEmoji(JSON.parse(message.content));
  const WrapperComponent = bubble ? Text : QuotedParagraph;
  switch (message.messageType) {
    case 'optimistic':
      return (
        <div key={message.id} className="markdown">
          <WrapperComponent me={me}>
            <div className={[`${matched} ? 'matchedMessage' : ''`]} dangerouslySetInnerHTML={{ __html: message.content }} />
          </WrapperComponent>
        </div>
      );
    case messageTypeObj.text:
    default:
      return (
        <WrapperComponent key={message.id} me={me}>
          {message.content}
        </WrapperComponent>
      );
    case messageTypeObj.media: {
      if (typeof message.id === 'number' && message.id < 0) {
        return null;
      }
      return (
        <Image
          key={message.id}
          onClick={openGallery}
          src={message.content}
        />
      );
    }
    case messageTypeObj.file: {
      const parsed = JSON.parse(message.content);
      const mimetype = parsed.mimetype;
      return (
      (!mimetype) ?
        <WrapperComponent key={message.id} me={me}>
          {message.parent && showParent && (
            // $FlowIssue
            <QuotedMessage message={message.parent} />
          )}
          {emojiOnly ? (
            <Emoji>
              {parsed && Array.isArray(parsed.blocks) && parsed.blocks[0].text}
            </Emoji>
          ) : (
            <div key={message.id} className="markdown">
              {
                redraft(parsed, messageRenderer)
              }
            </div>
          )}
        </WrapperComponent>
        :
        <>
        {
          (!mimetype.startsWith('image')) ?
            <div style={{display: 'flex'}}>
              <div className={"file-desc"}>
                🗎 {parsed.filename}
              </div>
              <div className={"file-actions"}>
                <a href={`${NODEJS_URL}${parsed.path}`} target={"_blank"}>
                  <SvgWrapper
                    style={{
                      cursor: 'pointer',
                      paddingLeft: '12px',
                      paddingTop: '2px',
                      display: 'flex',
                    }}
                  >
                    <Icon glyph="download" />
                  </SvgWrapper>
                </a>
              </div>

            </div> :
              <Image
                key={message.id}
                onClick={openGallery}
                src={`${NODEJS_URL}${parsed.path}`}
              />

        }
        </>
      )
    }
    case messageTypeObj.draftjs: {
      const parsed = JSON.parse(message.content);
      return (
        <WrapperComponent key={message.id} me={me}>
          {message.parent && showParent && (
            // $FlowIssue
            <QuotedMessage message={message.parent} />
          )}
          {emojiOnly ? (
            <Emoji>
              {parsed && Array.isArray(parsed.blocks) && parsed.blocks[0].text}
            </Emoji>
          ) : (
            <div key={message.id} className="markdown">
              {
                redraft(parsed, messageRenderer)
              }
            </div>
          )}
        </WrapperComponent>
      );
    }
  }
};

type QuotedMessageProps = {
  message: MessageInfoType,
  openGallery?: Function,
};

type QuotedMessageState = {
  isShort: boolean,
  isExpanded: boolean,
};

export class QuotedMessage extends React.Component<
  QuotedMessageProps,
  QuotedMessageState
> {
  constructor(props: QuotedMessageProps) {
    super(props);

    const short = isShort(props.message);
    this.state = {
      isShort: short,
      isExpanded: short,
    };
  }

  shouldComponentUpdate(
    nextProps: QuotedMessageProps,
    nextState: QuotedMessageState
  ) {
    const curr = this.props;
    if (curr.message.id !== nextProps.message.id) return true;
    return nextState.isExpanded !== this.state.isExpanded;
  }

  toggle = (e: any) => {
    e.stopPropagation();
    if (this.state.isShort) return;
    this.setState(prev => ({ isExpanded: !prev.isExpanded }));
  };

  render() {
    const { message, openGallery } = this.props;
    const { isExpanded } = this.state;
    return (
      <QuoteWrapper
        expanded={isExpanded}
        onClick={this.toggle}
        data-cy="quoted-message"
      >
        <Byline>
          <Icon glyph="reply" size={16} />
          <Name>{message.user.name}</Name>
          <Username>@{message.user.username}</Username>
        </Byline>
        <Body
          message={message}
          showParent={false}
          me={false}
          openGallery={openGallery ? openGallery() : () => {}}
          bubble={false}
        />
        {!isExpanded && <QuoteWrapperGradient />}
      </QuoteWrapper>
    );
  }
}