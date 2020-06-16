import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { getAccessibilityActiveState } from './accessibility';
import Icon from '../../components/icon';
import SipContext from '../../lib/sip_context';
import Tooltip from '../../components/tooltip';
import {
    AvatarGrid,
    AvatarLink,
    Label,
    IconWrapper,
} from './style';
import { SIP_STATUS_DISCONNECTED, SIP_STATUS_ERROR, TS_STATUS_ERROR } from '../../components/SipProvider/enums';
const ConditionalWrap = ({condition, wrap , children}) => condition ? wrap(children): children;

const CallsTab = (props) => {
    // const { count, data, isActive, currentUser } = props;
    const [toUrl, setUrl] = React.useState("/webapp/calls");
    const {status: sipStatus, transportStatus, errorMessage, activeLine} = React.useContext(SipContext);
    const [isConnected, setIsConnected] = React.useState(null);

    React.useEffect(() => {
        const isFailedToConnect = sipStatus === SIP_STATUS_DISCONNECTED || sipStatus === SIP_STATUS_ERROR || transportStatus === TS_STATUS_ERROR;
        setIsConnected(!isFailedToConnect);
    }, [sipStatus, transportStatus])
    // console.log("SİPstatus", sipStatus, transportStatus, "errormoessage", errorMessage);

    React.useEffect(() => {
        if(!activeLine) setUrl("/webapp/calls/contacts")
    }, [activeLine])
    return (
        <Route path="/webapp/calls">
            {({ match }) => (
                <ConditionalWrap
                    condition={!isConnected}
                    wrap={ children =>
                        <Tooltip content={` HATA. Arama alamaz ve arama yapamazsınız. Hata Kodu: ${errorMessage}`}>
                            {children}
                        </Tooltip>
                    }
                >
                    <AvatarGrid 
                        style={{ backgroundColor: isConnected ? '' : '#c31432', color: isConnected ? '' : 'white'}}
                        isActive={match && match.url.includes('/webapp/calls')}>
                        <AvatarLink
                            to={toUrl}
                            data-cy="navigation-messages"
                            {...getAccessibilityActiveState(
                                match && match.url.includes('/webapp/calls')
                            )}
                        >
                            <IconWrapper>
                                <Icon glyph="call" />
                            </IconWrapper>

                            <Label>Aramalar</Label>
                        </AvatarLink>
                    </AvatarGrid>

                </ConditionalWrap>

            )}
        </Route>
    )
};

export default withRouter(CallsTab);



