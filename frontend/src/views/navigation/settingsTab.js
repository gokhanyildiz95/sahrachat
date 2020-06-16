import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { getAccessibilityActiveState } from './accessibility';
import Icon from '../../components/icon';
import {
    AvatarGrid,
    AvatarLink,
    Label,
    IconWrapper,
} from './style';

const SettingsTab = (props) => {
    // const { count, data, isActive, currentUser } = props;

    return (
        <Route path="/webapp/settings">
            {({ match }) => (
                <AvatarGrid isActive={match && match.url.includes('/webapp/settings')}>
                    <AvatarLink
                        to={'/webapp/settings'}
                        data-cy="navigation-settings"
                        {...getAccessibilityActiveState(
                            match && match.url.includes('/webapp/settings')
                        )}
                    >
                        <IconWrapper>
                            <Icon glyph="settings" />
                        </IconWrapper>

                        <Label>Ayarlar</Label>
                    </AvatarLink>
                </AvatarGrid>
            )}
        </Route>
    )
};

export default withRouter(SettingsTab);



