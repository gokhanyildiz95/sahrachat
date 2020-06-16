import React from 'react';
import moment from 'moment';
import shave from 'shave';
import { Badge } from 'antd';
import UserAvatar from '../UserAvatar';
import FileUpload from '../FileUpload';
import './ConversationListItem.css';

const isAfter = (firstDate, secondDate) => {
    return moment(firstDate).isAfter(moment(secondDate))
}

const checkAnyUnread = (thread, user) => {
    // return true if the users last active is less than thread last message
    const userIndex = thread.members.findIndex(member => member.i_user.toString() === user.i_user.toString())
    const lastSeen = thread.members[userIndex].lastSeen;
    return thread.snippet ? !isAfter(lastSeen, thread.snippet.createdAt) : false;

}

export default class ConversationListItem extends React.Component {

    componentDidMount() {
        shave('.conversation-snippet', 30);
        const {first, thread, match} = this.props;
        if (match.path.includes('messageslist')) return;
        if (!(match.isExact && match.params.messId) && thread._id === first) {
            this.props.onClick();
        }
    }
    extractData = (members) => {
        return {
            name: members.length !== 0 ? members.map(member => {return `${member.name} ${member.surname}` }).join(', ') : 'qqq',
        }
    }

    render() {
            const { isGroup, groupInfo, thread, user } = this.props;
            const { name } = this.extractData(this.props.members);
            let snippetContent;
            let parsed;
            if (thread.snippet) {
                switch(thread.snippet.messageType) {
                    case 'draftjs':
                        parsed = JSON.parse(thread.snippet.content);
                        snippetContent = parsed.blocks.map(data => data.text).join('.');
                        break;
                    case 'media':
                        snippetContent = '📷 Resim';
                        break;
                    case 'file':
                        parsed = JSON.parse(thread.snippet.content);
                        snippetContent = '🗎 Dosya'
                        console.log("parsed", parsed)
                        if (parsed.mimetype && parsed.mimetype.startsWith('image')) {
                            snippetContent = '📷 Resim';
                        }
                        break;
                    default:
                    snippetContent = thread.snippet.content;
                };
            };
            let snippet = snippetContent ? snippetContent : '';

            const isAnyUnseen = this.props.threadUnseens.length > 0;
            const isAnyUnread = checkAnyUnread(thread, user);
            return (
                <FileUpload threadId={thread._id}>
                    <div className={`conversation-list-item` + (this.props.active ? ' active' : '') + ((isAnyUnseen  || isAnyUnread )? ' indicate': '')} key="_id" onClick={this.props.onClick}>
                        <UserAvatar
                            isGroup={isGroup}
                            // bu koşul geçici olarak düzenlenmiştir
                            userId={this.props.members[0] ? this.props.members[0].i_user : 0}
                            badgeCount={null}
                            size={54}
                            
                        />
                        <div className="conversation-info">
                            <h1 className="conversation-title">{isGroup ? groupInfo.name : name}</h1>
                            <p className="conversation-snippet">{ snippet }</p>
                        </div>
                        <div className="" style={{paddingRight: '8px'}}>
                            <Badge dot={(isAnyUnseen || isAnyUnread)} 
                                style={{
                                    width: '14px',
                                    backgroundColor: '#09f',
                                    height: '14px',
                                }}
                            />
                        </div>
                    </div>
                </FileUpload>
            )

    }

}
