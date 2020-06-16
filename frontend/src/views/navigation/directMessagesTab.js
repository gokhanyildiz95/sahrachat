import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { getAccessibilityActiveState } from './accessibility';
import Icon from '../../components/icon';
import {
    AvatarGrid,
    AvatarLink,
    Label,
    IconWrapper,
    RedDot,
} from './style';

const DirectMessagesTab = (props) => {
    // const { count, data, isActive, currentUser } = props;

    return (
        <Route path="/webapp/messages">
            {({ match }) => (
                <AvatarGrid isActive={match && match.url.includes('/webapp/messages')}>
                    <AvatarLink
                        to={'/webapp/messages'}
                        data-cy="navigation-messages"
                        {...getAccessibilityActiveState(
                            match && match.url.includes('/webapp/messages')
                        )}
                    >
                        <IconWrapper>
                            <Icon glyph="message-simple" />
                            {(props.notifyChat && !(props.isActive)) && (
                                <RedDot
                                    data-cy="unread-dm-badge"
                                    style={{ right: '-3px' }}
                                />
                            )}
                        </IconWrapper>

                        <Label>Konuşmalar</Label>
                    </AvatarLink>
                </AvatarGrid>
            )}
        </Route>
    )
};

export default withRouter(DirectMessagesTab);