import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import {
    NavigationWrapper,
    NavigationGrid,
} from './style';

import DirectMessagesTab from './directMessagesTab';
import CallsTab from './callsTab';
import SettingsTab from './settingsTab';
import BackTab from './backTab';

const Navigation = (props) => {
    const { navigationIsOpen, setNavigationOpen} = props;

    return (
        <NavigationWrapper
            data-cy="navigation-bar"
            headerExists={props.headerExists}
            headerSize={props.headerSize}
            isOpen={navigationIsOpen}>
            <NavigationGrid isOpen={navigationIsOpen}>
                <Route path="/webapp/messages">
                    {({ match }) => <DirectMessagesTab {...props} isActive={!!match} />}
                </Route>
                <Route path="/webapp/calls">
                    {({ match }) => <CallsTab isActive={!!match} />}
                </Route>
                <Route path="/webapp/settings">
                    {({ match }) => <SettingsTab isActive={!!match} />}
                </Route>
                <BackTab 
                    navigationIsOpen={navigationIsOpen}
                    setNavigationOpen={setNavigationOpen}
                />
            </NavigationGrid>

        </NavigationWrapper>
    )
}
export default withRouter(Navigation);