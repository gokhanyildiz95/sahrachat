import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import appType from '../../getAppType';
import './UserAvatar.css';

const { TENANT_ROOT } = appType.config;


const getUserPhotoUrl = (userId) => {
    // TODO it wont work for solo applications served on urls like chat.mobikob.com(desktop app)
    // get domain name from server
    const hostSplitted = window.location.hostname.split('.');
    const tenant = hostSplitted.length > 2 ? hostSplitted[0] : 'sahra';
    return `https://${tenant}.${TENANT_ROOT}/get_profile_image/${userId}`;
}

const UserAvatar = (props) => {
    /*
    Draws a user avatar

    Params:
        @isGroup: Decide whether draw user image or group image
        @tenant: user's tenant. sahra
        @badgeCount: Draws a number stated in this param next to the user avatar
        @size: Avatar size

    */
    const {userId, isGroup, size = 64, style = {}} = props;

    return (
        <div style={{paddingRight: '16px'}}>
            {
                (isGroup) ? (
                    <Avatar size={size} icon={<UserOutlined />} style={{ color: '#f56a00', backgroundColor: '#fde3cf' }} />
                ) : (
                    <Avatar size={size} src={getUserPhotoUrl(userId)} style={style}/>
                )
            }
        </div>
        
    )

}

export default UserAvatar;