import React from 'react';
import UserAvatar from '../UserAvatar';

const getDisplayName = (item, userId) => {
    if (item.isGroup) return item.groupInfo.name;
    const members = notMe(item.members, userId)
    return `${members[0].name} ${members[0].surname}`
}

const notMe = (members, userId) => { return members.filter(member => member.i_user !== userId.toString()) }

const getRenderedMessage = (snippet) => {
    let snippetContent;
    let parsed;
    switch(snippet.messageType) {
        case 'draftjs':
            parsed = JSON.parse(snippet.content);
            snippetContent = parsed.blocks.map(data => data.text).join('.');
            break;
        case 'media':
            snippetContent = '📷 Resim';
            break;
        case 'file':
            parsed = JSON.parse(snippet.content);
            snippetContent = '🗎 Dosya'
            if (parsed.mimetype.startsWith('image')) {
                snippetContent = '📷 Resim';
            }
            break;
        default:
        snippetContent = snippet.content;
    };
    return snippetContent;
}

export const ThreadList = ({ threads, members, userId, onThreadClick }) => {
    return (
        <div>
            {
                (threads) ?
                    threads.map(thread => {
                        const otherMembers = notMe(thread.members, userId)
                        let snippetContent;
                        let snippet;
                        if (thread.snippet) {
                            snippetContent = getRenderedMessage(thread.snippet);
                        };
                        
                        if (thread.matchedMessages) {
                            if (thread.matchedMessages.length > 1) {
                                snippet = {
                                    content: `Eşleşen ${thread.matchedMessages.length} mesaj var.`,
                                    messageType: 'text'
                                }
                            } else {
                                snippet = thread.matchedMessages[0]
                            }
                            snippetContent = getRenderedMessage(snippet);
                        }

                        snippet = snippetContent ? snippetContent : '';


                        return (
                            <div
                                className={`conversation-list-item`}
                                key={thread._id}
                                onClick={event => { console.log("click?"); onThreadClick(event, thread) }}
                            >
                                <UserAvatar
                                    isGroup={thread.isGroup}
                                    userId={thread.isGroup ? null : otherMembers[0].i_user}
                                    badgeCount={null}
                                    size={54}
                                />
                                <div className="conversation-info">
                                    <h1 className="conversation-title">{getDisplayName(thread, userId)}</h1>
                                    <p className="conversation-snippet">{ snippet }</p>
                                </div>
                            </div>

                        )
                    }) :
                    <div></div>
            }
        </div>
    )
}