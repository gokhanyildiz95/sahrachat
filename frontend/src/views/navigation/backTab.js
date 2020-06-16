import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import Icon from '../../components/icon';
import {
    AvatarGrid,
    AvatarLink,
    IconWrapper,
} from './style';
import {
    ShowOnMobile,
} from '../../components/layout';

const BackTab = (props) => {
    // const { count, data, isActive, currentUser } = props;
    const { navigationIsOpen, setNavigationOpen } = props;

    return (
        <ShowOnMobile>
        <AvatarGrid isActive={false}>
                <IconWrapper
                
                onClick={() => { setNavigationOpen(!navigationIsOpen) }}
                style={{justifyContent: 'center'}}
                >
                    <Icon glyph="view-back" />
                </IconWrapper>
        </AvatarGrid>

        </ShowOnMobile>
    )
};

export default withRouter(BackTab);



