import React from 'react';
import Toolbar from '../Toolbar';
import Icon from '../icon';
import { List, Row, Content, Label } from '../entities/listItems/style';
import {
    BrowserRouter as Router,
    Route,
    Link,
    useLocation,
} from "react-router-dom";
import {
    ViewGrid,
    SecondaryPrimaryColumnGrid,
    PrimaryColumn,
    SecondaryColumn,
} from '../layout';
import styled from 'styled-components';

import CallModal from '../CallModal';
import InCallWidget from '../InCallWidget';
import SipContext from '../../lib/sip_context';
import { SIP_STATUS_DISCONNECTED, SIP_STATUS_ERROR, TS_STATUS_ERROR } from '../SipProvider/enums';
import CrmUsersTable from '../CrmUsersTable';
import CDRHistoryTable from '../CDRHistoryTable';


const StyledLink = styled(Link)`
  color: currentcolor;
  text-decoration: none;
`;


// TODO seperate
const OptionsWrapper = styled.div`
    display: grid;
    height: calc(100vh - 10.4rem);
    position: relative;
    grid-template-rows: 1fr 56px;
    grid-template-areas:
        "top"
        "bottom";
`;
const TopList = styled.div`
    grid-area: top;
`;
const BottomItem = styled.div`
    grid-area: bottom;
    align-self: end;
`;

const CallButton = styled.button`
    box-shadow: 0 0.2rem 0.4rem -0.075rem rgba(0,0,0,.25);
    background: ${props => (props.isConnected ? '#28A745' : '#c31432')};
    color: ${props => (props.isConnected ? '#fff' : 'white')};
    border: 0;
    border-radius: .2rem;
    width: 100%;
    padding-left: 1.2rem;
    font-weight: 600;
    position: relative;
    border-radius: .2rem;
    padding: 0 2rem;
    min-width: 9.6rem;
    height: 3.3rem;
`;

function checkNotificationPermission() {
    if (!("Notification" in window)) {
        console.error("notifications are not supported");
        return;
    }

    Notification.requestPermission(function (status) {
        if (Notification.permission !== status) {
            Notification.permission = status;
        }

        if (Notification.permission !== 'granted')
            console.error("-- Lütfen Mobikob a mikrofon izni verin yoksa sistem çalışmayacaktır. :-)");
    });
}

function checkMicrophonePermission() {
    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        try {
            navigator.permissions.query({ name: 'microphone' }).then(function (permission) {
                if (permission.state === 'denied') {
                    console.error("-- ðŸ”¥ Mikrofon Erişimi Engellendi! Contact destek@mobikob.com");
                    alert("❌ Mikrofonunuza ulaşmadık.\n\n Engellenmiş olabilir. Lütfen Mobikob'a izin verin veya teknik destek ile iletişime geçin.");
                }
            }).catch(function () {
                checkMicrophonePermissionUsingGetUserMedia();
            });
        } catch (e) {
            checkMicrophonePermissionUsingGetUserMedia();
        }
    } else {
        checkMicrophonePermissionUsingGetUserMedia();
    }
}
function checkMicrophonePermissionUsingGetUserMedia() {
    navigator.getUserMedia({ audio: true }, function () {
        // mic enabled
    }, function () {
        console.error("Mikrofon Erişimi Engellendi! İletişim destek@mobikob.com");
        alert("❌ Mikrofonunuza ulaşmadık.\n\n Engellenmiş olabilir. Lütfen Mobikob'a izin verin veya teknik destek ile iletişime geçin.");
    });
}


const Mobicall = (props) => {
    const [callModalOpen, setCallModalOpen] = React.useState(false);
    const { status, transportStatus, retryRegister } = React.useContext(SipContext);
    const [isConnected, setIsConnected] = React.useState(null);
    const [currentComponent, setCurrentComponent] = React.useState("");

    React.useEffect(() => {
        const check = (status === SIP_STATUS_DISCONNECTED || status === SIP_STATUS_ERROR || transportStatus === TS_STATUS_ERROR);
        console.log("status", status === SIP_STATUS_DISCONNECTED, "error", status === SIP_STATUS_ERROR, "ts", transportStatus)
        console.log("is connected", check)
        setIsConnected(!check)
    }, [status, transportStatus])

    React.useEffect(() => {
        checkNotificationPermission();
        checkMicrophonePermission();
    }, []);

    return (
        <>
            <ViewGrid
                headerExists={props.headerExists}
                headerSize={props.headerSize}
            >
                <SecondaryPrimaryColumnGrid fullWidth={true} colGap={'10'}>
                    <SecondaryColumn
                        headerExists={props.headerExists}
                        headerSize={props.headerSize}
                    >
                        <div className="scrollable_ sidebar_">
                            <InCallWidget />
                            <Toolbar
                                key="mobicall"
                                title="Mobicall"
                                rightItems={[
                                ]}
                            />
                        </div>
                        <OptionsWrapper>
                            <TopList>
                                <Router>
                                    <List>
                                        <Route exact path={'/webapp/calls/contacts'}>
                                            {({ match }) => {
                                                if (match)
                                                   setCurrentComponent("CrmUsersTable");
                                                return (
                                                    <StyledLink to={'/webapp/calls/contacts'}>
                                                        <Row
                                                            isActive={match && match.url.includes('/webapp/calls/contacts')}
                                                        >
                                                            <Icon glyph="community" />
                                                            <Content>
                                                                <Label>
                                                                    Kişiler
                                                            </Label>
                                                            </Content>
                                                        </Row>
                                                    </StyledLink>)
                                            }
                                            }
                                        </Route>
                                        <Route exact path={'/webapp/calls/call-history'}>
                                            {({ match }) => {
                                                if (match)
                                                    setCurrentComponent("CDRHistoryTable");
                                                return (
                                                    <StyledLink to={'/webapp/calls/call-history'}>
                                                        <Row
                                                            isActive={match && match.url.includes('/webapp/calls/call-history')}
                                                        >
                                                            <Icon glyph="history" />
                                                            <Content>
                                                                <Label>
                                                                    Geçmiş
                                                            </Label>
                                                            </Content>
                                                        </Row>
                                                    </StyledLink>
                                                )
                                            }
                                            }
                                        </Route>
                                        <Route exact path={'/webapp/calls/speed-dial'}>
                                            {({ match }) => (
                                                <StyledLink to={'/webapp/calls/speed-dial'}>
                                                    <Row
                                                        isActive={match && match.url.includes('/webapp/calls/speed-dial')}
                                                    >
                                                        <Icon glyph="call-2" />
                                                        <Content>
                                                            <Label>
                                                                Hızlı Arama
                                                            </Label>
                                                        </Content>
                                                    </Row>
                                                </StyledLink>
                                            )}
                                        </Route>
                                    </List>

                                </Router>

                            </TopList>
                            <BottomItem data-cy="call-widget">
                                <CallButton
                                    isConnected={isConnected}
                                    onClick={() => {
                                        if (isConnected) {
                                            setCallModalOpen(true);
                                        } else {
                                            console.log("TODO SHOW error");
                                            retryRegister();
                                        }
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    >
                                        {
                                            (isConnected) ?
                                                <>
                                                    <Icon glyph="call-2" />
                                                Arama Yap
                                            </> :
                                                <>
                                                    <Icon glyph="view-reload" />
                                                Kayıt olmayı tekrar dene!
                                            </>
                                        }

                                    </div>
                                </CallButton>
                            </BottomItem>
                        </OptionsWrapper>
                    </SecondaryColumn>
                    <PrimaryColumn fullWidth={true}>
                         {(function() {
                            switch (currentComponent) {
                            case 'CrmUsersTable':
                                return <CrmUsersTable />
                            case 'CDRHistoryTable':
                                return <CDRHistoryTable />
                            default:
                                return null;
                            }
                        })()}

                    </PrimaryColumn>

                </SecondaryPrimaryColumnGrid>
            </ViewGrid>
            <CallModal user={props.user} isOpen={callModalOpen} closeModal={setCallModalOpen} />
        </>
    );
};

export default Mobicall;
