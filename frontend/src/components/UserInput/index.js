import React, {useContext} from 'react';
import Textarea from 'react-textarea-autosize';
import './UserInput.css';
import {
    ChatInputContainer,
    ChatInputWrapper,
    InputWrapper,
    // PhotoSizeError,
    // PreviewWrapper,
    // RemovePreviewButton,
  } from './style';
import Icon, { SvgWrapper } from '../icon';

import processMessageContent, {
    messageTypeObj
} from '../../shared/draft-utils/process-message-content';
import dropzoneRef from '../../shared/dropzone_context';


export default class UserInput extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state= {
            message: ""
        }
    }


    handleChange = (e) => {
        this.setState({
            message: e.target.value
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        // TODO check media ?
        if (this.state.message === '') return null;
        const content = processMessageContent(messageTypeObj.text, this.state.message);
        const messageType = messageTypeObj.draftjs;
        this.props.addMessage({variables: {content: content, threadId: this.props.threadId, messageType: messageType}});
        this.setState({
            message: ''
        })
    }
    
    handleKeyPress = (e) => {
        // We shouldn't do anything during composition of IME.
        // `keyCode === 229` is a fallback for old browsers like IE.
        if (e.isComposing || e.keyCode === 229) {
          return;
        }
        switch (e.key) {
          // Submit on Enter unless Shift is pressed
          case 'Enter': {
            if (e.shiftKey) return;
            e.preventDefault();
            this.handleSubmit(e);
            return;
          }
          // If backspace is pressed on the empty
          case 'Backspace': {
            // if (text.length === 0) removeAttachments();
            return;
          }
          default:
            return;
        }
      };
    render() {
        return (
        <ChatInputContainer>
            <ChatInputWrapper>

                    <label
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <SvgWrapper
                            style={{ cursor: 'pointer' }}
                            onClick={this.props.dropzone.open}
                            key="detailsuser"
                        >
                            <Icon glyph="plus" />
                        </SvgWrapper>
                    </label>
                <form ref="submitMessage"
                    onSubmit={this.handleSubmit}
                    className="send-message-form">

                 <InputWrapper
                    hasAttachment={false}
                    networkDisabled={false}
                >
                    <Textarea
                        data-cy="compone-input"
                        value={this.state.message}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyPress}
                        maxRows={15}
                        placeholder="Mesaj yaz.."
                        />

                </InputWrapper>
                    <div 
                        onClick={this.handleSubmit}
                    >
                    {
                        this.props.rightItems
                    }

                    </div>
                </form>

            </ChatInputWrapper>
        </ChatInputContainer>
        )
    }
}
                    /*
                    <input
                        onChange={this.handleChange}
                        value={this.state.message}
                        placeholder="Mesaj yaz.."
                        className="compose-input"
                        type="text" />
                        */