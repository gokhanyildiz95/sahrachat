import React from 'react';
import moment from 'moment'
import {
    CallDiv,
    CallHeader,
    CallBar,
    CallBarSection,
    CallBody,
    CallBarContainer,
} from './style';
import Icon from '../icon';
import SipContext from '../../lib/sip_context';
import { withRouter } from 'react-router-dom';


const InCallWidget = (props) => {
    const { history } = props;
    const { activeLine, rejectCall } = React.useContext(SipContext);

    return (
        <>
            {(activeLine && !activeLine.incomingCall) &&
                <CallDiv
                    onClick={() => {history.push(`/webapp/activecalls/${activeLine.callUUID}`)}}
                    >
                    <CallHeader>
                        <div style={{
                            flex: 'auto',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {activeLine.connectedNumber}
                        </div>
                        <div>
                            {
                                moment("2015-01-01").startOf('day')
                                    .seconds(activeLine.counter)
                                    .format('mm:ss')
                            }
                        </div>
                    </CallHeader>
                    <CallBody data-cy="call-body">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            paddingBottom: '20px'
                        }}>
                            <CallBarSection
                                style={{
                                    backgroundColor: '#40a579',
                                    borderRadius: '31px',
                                }}
                                data-cy="callbar-section">
                                <Icon glyph="person" fill={'#e2e2f6'} />
                            </CallBarSection>
                        </div>
                        <CallBarContainer data-cy="callbar-container">
                            <CallBar data-cy="callbar">
                                <CallBarSection data-cy="callbar-section">
                                    <Icon glyph="microphone" fill={'#e2e2f6'} />
                                </CallBarSection>
                                <CallBarSection>
                                    <Icon glyph="more" fill={'#e2e2f6'} />
                                </CallBarSection>
                                <CallBarSection 
                                    onClick={() => {rejectCall(activeLine)}}
                                    style={{ backgroundColor: '#de1d1d' }}>
                                    <Icon glyph="end-call" fill={'#e2e2f6'} />
                                </CallBarSection>

                            </CallBar>


                        </CallBarContainer>
                    </CallBody>

                </CallDiv>
            }
        </>
    )
}

export default withRouter(InCallWidget);