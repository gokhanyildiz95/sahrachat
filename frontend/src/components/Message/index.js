import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import './Message.css';
import moment from 'moment';
import 'moment/locale/tr';
import Avatar from 'react-avatar';
import { Body } from './body';
import appType from '../../getAppType';
import { EllipsisOutlined, EditOutlined } from '@ant-design/icons'
import { Tooltip, Button, Menu, Dropdown, message as AntMessage } from 'antd';
import { deleteMessageMutation } from '../../shared/graphql/mutations/message/deleteMessage';
import { threadMessages } from '../../shared/graphql/queries/thread/getThreadMessageConnection';

const { TENANT_ROOT } = appType.config;


const getUserPhotoUrl = (userId) => {
    // TODO add this helper to global helper file
    const hostSplitted = window.location.hostname.split('.');
    const tenant = hostSplitted.length > 2 ? hostSplitted[0] : 'sahra';
    return `https://${tenant}.${TENANT_ROOT}/get_profile_image/${userId}/`;
}


const getTimeStamp = (createdAt, format) => {
    // TODO add this helper to global helper file
    return moment(createdAt).locale('tr').format(format);
    /*
    const timestamp = id.toString().substring(0, 8)
    const date = new Date(parseInt(timestamp, 16) * 1000)
    return moment(date).format('LLLL');
    */
}

const MessageActions = ({ me, message, messageId, threadId, setEditMessageModalVisible, setEditMessageContent }) => {
    const [deleteMessage] = useMutation(deleteMessageMutation, {
        update: store => {
        },
    })

    const handleMenuClick = (e) => {
        console.log('click', e, "thread", threadId);
        if (e.key === "delete_msg") {
            console.log("messageID", messageId)
            deleteMessage({
                variables: { id: messageId },
                refetchQueries: [{ query: threadMessages, variables: { threadId } }]
            }).then(() => {
                AntMessage.success('Mesaj silindi!')
            })
        } else if (e.key === "edit_msg") {
            setEditMessageModalVisible(true)
            setEditMessageContent(message)
        } else if (e.key === "copy_msg") {

        }
    }

    const menu = () => {
        return (
            <>
                <Menu onClick={handleMenuClick}>
                    {
                        // TODO dont show if deleted
                        (!message.isDeleted && me) &&
                        <Menu.Item key="delete_msg">Sil</Menu.Item>
                    }
                    {
                        (!message.isDeleted && me) &&
                        <Menu.Item key="edit_msg" title="Mesajı düzenle">Düzenle</Menu.Item>
                    }
                    <Menu.Item key="answer_msg" title="Alıntıla">Alıntıla</Menu.Item>
                </Menu>
            </>
        )
    }

    return (
        <div style={{
            right: `${me ? '' : '-40px'}`,
            left: `${me ? '-66px' : ''}`,
            bottom: '4px',
            position: 'absolute',
            top: 'auto',
        }}>
            <Dropdown overlay={menu}>
                <Button type="link" > <EllipsisOutlined /> </Button>
            </Dropdown>
        </div>
    );

}

// Get a single message element
// It takes css classes based on sequences
// changed property keeps tracks of each users own message so
// if A's message changed to B we can show B's icon
const MessageContent = (props) => {
    const {
        data,
        isMine,
        startsSequence,
        endsSequence,
        showTimestamp,
        fullName,
        userData,
        changed,
        matched,
        threadId,
        setEditMessageModalVisible,
        setEditMessageContent,
    } = props;

    const canModerateMessage = true;
    const canEditMessage = true;
    const friendlyTimestamp = getTimeStamp(data.createdAt, 'LL');
    const friendlyTimestampLong = getTimeStamp(data.createdAt, 'LLLL');
    const showIcon = (startsSequence && endsSequence) || startsSequence;
    const [isShown, setIsShown] = useState(false);

    return (
        <div id={"id_" + data.id} className={[
            'message',
            `${isMine ? 'mine' : ''}`,
            `${startsSequence ? 'start' : ''}`,
            `${endsSequence ? 'end' : ''}`
        ].join(' ')}>
            {
                showTimestamp &&
                <div className="timestamp">
                    {friendlyTimestamp}
                </div>
            }

            <div className="bubble-container"
                onMouseEnter={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
            >
                {
                    (isMine) ?
                        <>
                            <div className={['bubble', `${matched ? 'matchedMessage' : ''}`].join(' ')} style={{ position: 'relative', marginRight: (!changed && !showIcon) ? '45px' : '' }}>
                                <Tooltip title={friendlyTimestampLong} placement="topLeft">
                                    <div key={data._id} className="markdown" style={{display: 'flex', maxWidth: window.innerWidth * .7}}>
                                        {
                                            (isShown) &&
                                            <MessageActions
                                                me={isMine}
                                                message={data}
                                                messageId={data.id}
                                                threadId={threadId}
                                                setEditMessageModalVisible={setEditMessageModalVisible}
                                                setEditMessageContent={setEditMessageContent}
                                            />
                                        }
                                        <Body
                                            me={isMine}
                                            openGallery={() => {window.open("../../chat"+JSON.parse(data.content).path)}}
                                            message={data}
                                            matched={matched}
                                        />
                                        {
                                            (!data.isDeleted && data.modifiedAt) &&
                                            <EditOutlined style={{paddingLeft: '10px'}} />
                                        }

                                    </div>
                                </Tooltip>
                            </div>
                            <>
                                {
                                    (showIcon) && <div title={fullName} style={{ cursor: 'pointer' }}>
                                        <Avatar
                                            size={36}
                                            textSizeRatio={1.25}
                                            round={true}
                                            src={getUserPhotoUrl(userData.i_user)}
                                            style={{ marginTop: '10px', marginRight: '0px', marginLeft: '9px' }}
                                        />
                                    </div>
                                }
                            </>
                        </>
                        :
                        <>
                            <>
                                {
                                    (showIcon) && <div title={fullName} style={{ cursor: 'pointer' }}>
                                        <Avatar
                                            size={36}
                                            textSizeRatio={1.25}
                                            round={true}
                                            src={getUserPhotoUrl(userData.i_user)}
                                            style={{ marginRight: '8px', marginLeft: '9px', marginTop: '3px' }}
                                        />
                                    </div>
                                }
                            </>
                            <div className={['bubble', `${matched ? 'matchedMessage' : ''}`].join(' ')} style={{ position: 'relative', marginLeft: (!changed && !showIcon) ? '53px' : '' }}>
                                {
                                    (isShown) &&
                                    <MessageActions
                                        me={isMine}
                                        messageId={data.id}
                                        threadId={threadId}
                                        message={data}
                                        setEditMessageModalVisible={setEditMessageModalVisible}
                                        setEditMessageContent={setEditMessageContent}
                                    />

                                }
                                <Tooltip title={friendlyTimestampLong} placement="topLeft" >
                                    <div key={data._id} className="markdown" style={{display: 'flex'}}>
                                        {
                                            (!data.isDeleted && data.modifiedAt) &&
                                            <EditOutlined style={{paddingRight: '10px'}} />
                                        }
                                        <Body
                                            me={isMine}
                                            openGallery={() => {window.open("../../chat"+JSON.parse(data.content).path)}}
                                            message={data}
                                        />

                                    </div>
                                </Tooltip>
                            </div>
                        </>
                }
            </div>
        </div >
    );
}
/*
<WrapperComponent me={isMine}>
<div dangerouslySetInnerHTML={{ __html: data.content }} />
</WrapperComponent>
*/


export const Message = ({ data, direction, fullName, threadId, userData, changed, startsSequence, endsSequence, showTimestamp, matched,
    setEditMessageModalVisible, setEditMessageContent
}) => {
    // const friendlyTimestamp = moment(message.timestamp).format('LLLL');
    // console.log("ful", fullName, "changed", changed)
    const isMine = direction === "sent" ? true : false
    return (
        <MessageContent
            data={data}
            isMine={isMine}
            direction={direction === "sent" ? true : false}
            startsSequence={startsSequence}
            endsSequence={endsSequence}
            setEditMessageContent={setEditMessageContent}
            setEditMessageModalVisible={setEditMessageModalVisible}
            showTimestamp={showTimestamp}
            fullName={fullName}
            userData={userData}
            threadId={threadId}
            changed={changed}
            matched={matched}
        />

    )
}



/*
<div className="bubble" title={getTimeStamp(data.id)} style={{ marginLeft: !changed ? '45px' : ''}}>
    { data.content }
</div>
*/
/*
<div className="bubble" title={getTimeStamp(data.id)} style={{ marginRight: !changed ? '45px' : ''}}>
    { data.content }
</div>
*/

/*
                <div>
                    <div style={{width: '32px', height: '32px'}}>
                        <img alt="Facebook User" src="https://scontent-otp1-1.xx.fbcdn.net/v/t1.0-1/c35.0.120.120a/p120x120/10645251_10150004552801937_4553731092814901385_n.jpg?_nc_cat=1&amp;_nc_ohc=cJVcMdBUCOgAQnprXK-3PYECCbIcUJ5No-T-C1PkJOAv20Fnp6Kg04a-A&amp;_nc_ht=scontent-otp1-1.xx&amp;oh=b59281b0ac3c1615973cbbdfe8fe30db&amp;oe=5E80706E" height="32" width="32" class="img" />
                    </div>
                </div>
    */
