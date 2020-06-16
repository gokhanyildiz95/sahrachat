import React, { useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { ListGroup } from 'react-bootstrap';
import moment from 'moment'
import Tooltip from '../tooltip';
import CallModal from '../CallModal';
import uuidTime from 'uuid-time';
import {
    ViewGrid,
    PrimarySecondaryColumnGrid,
    PrimaryColumn,
    SecondaryColumn
} from '../layout';
import {
    CallDiv,
    CallHeader,
    CallBar,
    CallBarSection,
    CallBody,
    CallBarContainer,
} from './style';

import {
    useParams
} from "react-router-dom";

import Icon from '../icon';
import { PropagateLoader } from "react-spinners";
import SipContext from '../../lib/sip_context';
import 'tippy.js/dist/tippy.css';
import 'simplebar/dist/simplebar.min.css';

const CallingIndicator = (props) => {
    return (
        (props.activeLine) ?
            <CallHeader style={{ flexDirection: 'column' }}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    opacity: '0.8',
                    paddingBottom: '1rem',
                }}>
                    Aranıyor
                </div>
                <div style={{
                    paddingBottom: '1.7rem',
                    paddingRight: '9px',
                }}>
                    <PropagateLoader
                        color={'#ffffff'}
                        loading={true}
                    />
                </div>
            </CallHeader> : <></>
    )

}


function removeDuplicates(myArr, prop="key") {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

const CallCounter = (props) => {
    const { counter } = props;
    return (
        <CallHeader style={{ flexDirection: 'column' }}>
            <div style={{
                fontSize: '23px',
                fontWeight: '500',
                paddingBottom: '1rem',
            }}>
                {
                    moment("2015-01-01").startOf('day')
                        .seconds(counter)
                        .format('mm:ss')
                }
            </div>
        </CallHeader>
    )
}

const CallView = (props) => {
    const [isTransfer, setTransfer] = React.useState(false);
    const [isDTMF, setDTMF] = React.useState(false);
    const [isCallModalOpen, changeCallModalStatus] = React.useState(false);
    const {
        lines,
        activeLine,
        rejectCall,
        transferCall,
        muteCall,
        changeLine,
        holdSession,
        sendDtmf 
    } = React.useContext(SipContext);
    const { history } = props;
    const sortedLines = lines.sort((a, b) => { return a.callUUID ? uuidTime.v1(a.callUUID) : -1 > b.callUUID ? uuidTime.v1(b.callUUID) : -1 });
    let linesButThis;
    if (!activeLine) {
        linesButThis = []
    } else {
        linesButThis = sortedLines.length > 0 ? sortedLines.filter(line => {
            return line.callUUID !== activeLine.callUUID;
        }): [];
    }

    const onTransfer = (to) => {
        // doin it on modal changeCallModalStatus(false);
        if (activeLine) {
            transferCall(activeLine, to)
        }
    }

    useEffect(() => {
        let timer;
        if (!activeLine) {
            console.log("currentLine is not exists", history)
            timer = setTimeout(() => {
                history.push(`/webapp/calls/contacts`)
            }, 1000);
        }
        return () => timer ? clearTimeout(timer) : null;
    }, [activeLine, history, linesButThis]);

    const renderOtherCalls = (line) => {
        return (
            (line.callUUID !== activeLine.callUUID) ?
            <div
                key={line.callUUID}
                style={{
                    backgroundColor: '#f3eadf',
                    display: 'flex',
                    color: 'black',
                    justifyContent: 'space-between',
                    padding: '12px',
                    alignItems: 'center',
                }}
            >
                <div>
                    {line.connectedNumber} <small>{line.connectedName}</small>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginLeft: '1rem',
                    marginTop: '1rem',
                }}>
                    <Tooltip content={"Çağrıya Geç"}>
                        <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                paddingRight: '17px',
                                alignItems: 'center',
                            }}
                            onClick={() => { changeLine(line) }}
                        >
                            <Icon glyph="arrow-right" />
                            <small>Aktif Et</small>
                        </div>
                    </Tooltip>
                    <Tooltip content={"Çağrıları Birleştir"}>
                        <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                paddingRight: '17px',
                                alignItems: 'center',
                            }}
                            // onClick={() => { mergeLines(line) }}
                        >
                            <Icon glyph="merge-call" />
                            <small>Birleştir</small>
                        </div>
                    </Tooltip>
                </div>
            </div> : <></>
        ) 
    }



    return (
        <>
            <CallModal
                isTransfer={isTransfer}
                isDTMF={isDTMF}
                onDigitPressed={sendDtmf}
                onCallPressed={onTransfer}
                isOpen={isCallModalOpen}
                closeModal={changeCallModalStatus}

            />
            <CallDiv>
                <CallBody data-cy="call-body">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        height: '100%',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <CallBarSection
                            style={{
                                backgroundColor: activeLine ? '#40a579' : '#cb3837',
                                borderRadius: '91px',
                                width: '180px',
                                height: '180px',
                            }}
                            data-cy="callbar-section">
                            <Icon glyph="person" fill={'#e2e2f6'} size={'180'} />
                        </CallBarSection>
                        <div style={{
                            paddingTop: '1rem',
                            fontWeight: '500',
                            fontSize: '28px'
                        }}>
                            {
                                (activeLine) ?
                                    activeLine.connectedNumber : ''
                            }
                        </div>
                        <div style={{
                            paddingTop: '1rem',
                            fontSize: '23px',
                            opacity: '0.8',
                        }}>
                            {
                                (activeLine) ?
                                    activeLine.connectedName : ''
                            }
                        </div>
                    </div>
                    {
                        (linesButThis.length > 0) &&
                        <CallBarContainer data-cy="callbar-container" style={{ paddingBottom: '3rem' }}>
                            <CallHeader style={{ flexDirection: 'column' }}>
                                <div style={{
                                    fontSize: '17px',
                                    fontWeight: '500',
                                    paddingBottom: '1rem',
                                    width: '25rem',
                                }}>
                                    <div style={{ paddingBottom: '15px' }}> Bekleyen Diğer Çağrılar </div>
                                    <ListGroup variant="flush" style={{}}>
                                        <SimpleBar style={{ height: '9rem', overflow: 'auto' }}>
                                            {
                                                removeDuplicates(linesButThis.map(line => (renderOtherCalls(line, () => { }))))
                                            }
                                        </SimpleBar>
                                    </ListGroup>
                                </div>
                            </CallHeader>

                        </CallBarContainer>
                    }
                    <CallBarContainer data-cy="callbar-container" style={{ paddingBottom: '3rem' }}>
                        {
                            (activeLine) &&
                                (activeLine.inCall) ?
                                    <CallCounter counter={activeLine.counter} /> : <CallingIndicator activeLine={activeLine} />
                        }
                        <CallBar data-cy="callbar">
                            <CallBarSection data-cy="callbar-section-mic" onClick={() => { muteCall(activeLine) }}>
                                <span>
                                    {
                                        (activeLine) &&
                                        <Tooltip content={activeLine.muted ? 'Sesi Aç' : 'Sesi Kapa'}>
                                            <span>
                                                <Icon glyph={activeLine.muted ? "microphone-slash" : "microphone"} fill={'#e2e2f6'} />
                                            </span>
                                        </Tooltip>
                                    }
                                </span>
                            </CallBarSection>
                            <CallBarSection data-cy="callbar-section-hold" onClick={() => { holdSession(activeLine) }}>
                                <span>
                                    {
                                        (activeLine) &&
                                        <Tooltip content={activeLine.onHold ? 'Devam Et' : 'Beklet'}>
                                            <span>
                                                <Icon glyph="hold" fill={activeLine.onHold ? '#51dc00' : '#e2e2f6'} style={{ transform: 'scale(1.5)' }} />
                                            </span>
                                        </Tooltip>
                                    }
                                </span>
                            </CallBarSection>
                            <CallBarSection data-cy="callbar-section-transfer" onClick={() => { setTransfer(true); setDTMF(false); changeCallModalStatus(true); }}>
                                <Tooltip content={'Transfer Et'}>
                                    <span>
                                        <Icon glyph="transfer" fill={'#e2e2f6'} style={{ transform: 'scale(1.5)' }} />
                                    </span>
                                </Tooltip>
                            </CallBarSection>
                            <CallBarSection onClick={() => { setTransfer(true); setDTMF(true); changeCallModalStatus(true); }}>
                                <Tooltip content={'Tuş Takımı'}>
                                    <span style={{paddingTop: '11px'}}>
                                        <Icon glyph="apps" fill={'#e2e2f6'} />
                                    </span>
                                </Tooltip>
                            </CallBarSection>
                            <CallBarSection >
                                <Tooltip content={''}>
                                    <span>
                                        <Icon glyph="more" fill={'#e2e2f6'} />
                                    </span>
                                </Tooltip>
                            </CallBarSection>
                            <CallBarSection
                                onClick={() => { rejectCall(activeLine) }}
                                style={{ backgroundColor: '#de1d1d' }}>
                                <Tooltip content={'Çağrıyı Sonlandır'}>
                                    <span>
                                        <Icon glyph="end-call" fill={'#e2e2f6'} />
                                    </span>
                                </Tooltip>
                            </CallBarSection>

                        </CallBar>


                    </CallBarContainer>
                </CallBody>

            </CallDiv>
        </>
    )
}

export const FullScreenCallWidget = (props) => {
    /* eslint-disable-next-line */
    const [fullWidth, setFullWidth] = React.useState(true);
    const { history } = props;
    let { callId } = useParams();
    console.log("math", callId, "his", history)

    return (
        <>
            {
                fullWidth ?
                    (
                        <ViewGrid
                            headerExists={props.headerExists}
                            headerSize={props.headerSize}
                        >
                            <CallView history={props.history} callId={callId} />
                        </ViewGrid>
                    ) : (
                        <>
                            <PrimarySecondaryColumnGrid>
                                <PrimaryColumn fullWidth={fullWidth}>
                                    <CallView callId={callId} history={props.history} />
                                </PrimaryColumn >
                                <SecondaryColumn>
                                    <div>
                                        right
                                        </div>
                                </SecondaryColumn>
                            </PrimarySecondaryColumnGrid >
                        </>
                    )
            }
        </>
    )

}