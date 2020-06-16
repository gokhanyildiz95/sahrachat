import React from 'react';
import { withRouter } from 'react-router-dom';
import SipContext from '../../lib/sip_context';
import uuidv4 from 'uuidv4';
import * as SIP from "sip.js";
import { IncomingCallNotification } from './CallNotification';
import openCallNotification, { hideCallNotification } from './CallNotificationForeground';
import useSound from 'use-sound';

import {
  // CALL_DIRECTION_INCOMING,
  // CALL_DIRECTION_OUTGOING,
  // CALL_STATUS_ACTIVE,
  // CALL_STATUS_IDLE,
  // CALL_STATUS_STARTING,
  // CALL_STATUS_STOPPING,
  CALL_STATUS_RINGING,
  // SIP_ERROR_TYPE_CONFIGURATION,
  // SIP_ERROR_TYPE_CONNECTION,
  // SIP_ERROR_TYPE_REGISTRATION,
  SIP_STATUS_CONNECTED,
  SIP_STATUS_CONNECTING,
  SIP_STATUS_DISCONNECTED,
  SIP_STATUS_ERROR,
  SIP_STATUS_REGISTERED,
  TS_STATUS_CONNECTED,
  TS_STATUS_CONNECTING,
  TS_STATUS_DISCONNECTED,
  TS_STATUS_ERROR,
} from "./enums";
import UIfx from './uifx';

const ringingFX = new UIfx(
  "https://mobikob.com/static/sound/ringing.ogg",
  {
    volume: 0.8, // number between 0.0 ~ 1.0
    throttleMs: 100
  }
)

const incomingRingingFX = new UIfx(
  "https://mobikob.com/static/sound/piano_ring.ogg",
  {
    volume: 0.8, // number between 0.0 ~ 1.0
    throttleMs: 100
  }
)



const wss_servers = [
  {
    ws_uri: "wss://pbx2.sahratelekom.com.tr:7443",
    weight: 1
  }
]
const sip_uri = "pbx2.sahratelekom.com.tr";


class SipProvider extends React.Component {
  constructor(props) {
    super(props);

    this.ua = null;
    this.remoteMedia = null;
    this.localMedia = null;
    this.timeouts = [];
    this.intervals = [];
    this.state = {
      sipStatus: SIP_STATUS_DISCONNECTED,
      transportStatus: TS_STATUS_CONNECTING,
      sipErrorType: null,
      sipErrorMessage: "Bu kullanıcıya ait bir dahili bulunmamaktadır.",
      callCounterpart: null,
      lines: [],
      activeLine: null,
      /*
      lines: [{
       connectedName: 'Lyle Pratt',
       connectedNumber: '+13185483890',
       counterTimeout: false, // increment counter by 1 to keep sec
       counter: 0,
       connectingCall: false, // when user dials
       inCall: true, // when call accepted
       inConnectedCall: false, // same as inCall
       incomingCall: true, // if call comes from fs
       stagingTransfer: false,
       onHold: false, // call on hold
       muted: false, // call muted
       uaSession: false, // call session
       uaStatus: '', // ua obj status
       recording: false,
       callUUID: '1',
      },
      {
        connectedName: 'Festo Jibbles',
        connectedNumber: '+15128278678',
        counterTimeout: false,
        counter: 0,
        connectingCall: false,
        inCall: false,
        inConnectedCall: false,
        incomingCall: false,
        stagingTransfer: false,
        onHold: true,
        muted: false,
        uaSession: false,
        uaStatus: 'Holding',
        callUUID: '2'
      },
      {
        connectedName: 'Festo2 Jibbles',
        connectedNumber: '+15128278678',
        counterTimeout: false,
        counter: 0,
        connectingCall: false,
        inCall: false,
        inConnectedCall: false,
        incomingCall: false,
        stagingTransfer: false,
        onHold: true,
        muted: false,
        uaSession: false,
        uaStatus: 'Holding',
        callUUID: '3'
      },
      {
        connectedName: 'Festo2 Jibbles',
        connectedNumber: '+15128278678',
        counterTimeout: false,
        counter: 0,
        connectingCall: false,
        inCall: false,
        inConnectedCall: false,
        incomingCall: false,
        stagingTransfer: false,
        onHold: true,
        muted: false,
        uaSession: false,
        uaStatus: 'Holding',
        callUUID: '4'
      }
    ],
      activeLine: {
       connectedName: 'Lyle Pratt',
       connectedNumber: '+13185483890',
       counterTimeout: false,
       counter: 0,
       connectingCall: false,
       inCall: true,
       inConnectedCall: false,
       incomingCall: true,
       stagingTransfer: false,
       onHold: false,
       muted: false,
       uaSession: false,
       uaStatus: '',
       recording: false,
       callUUID: '1',
      }, */
    }

  }

  compomentDidUpdate() {
    console.log("did update provider")
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.beforeunload);
    this.localMedia = window.document.createElement("audio");
    this.localMedia.id = "sip-provider-local-media";
    this.remoteMedia = window.document.createElement("audio");
    this.remoteMedia.id = "sip-provider-remote-media";
    window.document.body.appendChild(this.localMedia);
    window.document.body.appendChild(this.remoteMedia);

    this.createUA();
    console.log("did mount provider")
  }


  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.beforeunload.bind(this));
    console.log("unmouunt")
    this.remoteMedia.parentNode.removeChild(this.remoteMedia);
    this.localMedia.parentNode.removeChild(this.localMedia);
    if (this.ua) {
      this.ua.stop();
      this.ua.unregister();
      this.ua = null;
    }
    this.timeouts.forEach(({ _id, timeoutObj }) => {
      if (timeoutObj) {
        clearTimeout(timeoutObj)
        console.log("clearing a timeout, id", _id);
      }

    })
    delete this.ua;
  }

  beforeunload = (e) => {
    console.log("unloaddd")
    if (this.state.lines && this.state.lines.length > 0) {
      e.preventDefault();
      e.returnValue = true;
    }
  }

  addMidLines = (description) => {
    let sdp = description.sdp || "";
    if (sdp.search(/^a=mid.*$/gm) === -1) {
      const mlines = sdp.match(/^m=.*$/gm);
      const sdpArray = sdp.split(/^m=.*$/gm);
      if (mlines) {
        mlines.forEach((elem, idx) => {
          mlines[idx] = elem + "\na=mid:" + idx;
        });
      }
      sdpArray.forEach((elem, idx) => {
        if (mlines && mlines[idx]) {
          sdpArray[idx] = elem + mlines[idx];
        }
      });
      sdp = sdpArray.join("");
      description.sdp = sdp;
    }
    return Promise.resolve(description);
  }

  registerPresence = (username) => {
    console.log('Registering ' + username + ' for presence.');
    const presenceSubscription = this.ua.subscribe(username + '@sahra.pbx2.sahratelekom.com.tr', 'presence');
    presenceSubscription.on('notify', (notification) => {
      console.log('subscription notification ' + username);

      var status = notification.request.body.split('<dm:note>')[1];
      status = status.split('</dm:note>')[0];
      if (status === 'Available') {
        status = 'Online';
      }
      else if (status === 'Unregistered') {
        status = 'Offline';
      }
      else {
        status = status.split(' ')[0];
      }
      console.log("status", status);
    });
  }

  startRinging = (line) => {
    console.log("ringing started for line", "cond", line && !line.inCall);
    ringingFX.play();
    if (line) {
      line.ringing = setInterval(() => {
        const currentLine = this.state.lines.find(linex => linex.callUUID === line.callUUID);
        if (!currentLine) {
          ringingFX.stop();
          clearInterval(line.ringing);
          return;
        }
        if (currentLine.inCall) {
          ringingFX.stop();
          clearInterval(line.ringing);
          return;
        }
        console.log("playy")
        ringingFX.play();
      }, 4000)
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linex => linex.callUUID !== line.callUUID), line],
        activeLine: (previousState.activeLine) ? (
          (previousState.activeLine.callUUID === line.callUUID) ?
            line : previousState.activeLine
        ) : line
      }));
    }
  }

  startIncomingRinging = (line) => {
    console.log("ringing started for inline", "cond", line && !line.inCall);
    incomingRingingFX.play();
    if (line && !line.inCall) {
      line.incomingRinging = setInterval(() => {
        const currentLine = this.state.lines.find(linex => linex.callUUID === line.callUUID);
        if (!currentLine) {
          incomingRingingFX.stop();
          clearInterval(line.incomingRinging);
          return;
        }
        if (currentLine.inCall) {
          incomingRingingFX.stop();
          clearInterval(line.incomingRinging);
          return;
        }
        console.log("playy", currentLine);
        incomingRingingFX.play();
      }, 2900)
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linex => linex.callUUID !== line.callUUID), line],
        activeLine: (previousState.activeLine) ? (
          (previousState.activeLine.callUUID === line.callUUID) ?
            line : previousState.activeLine
        ) : line
      }));
    }
  }

  startCounter = (line) => {
    //  create interval func that increment counter by 1 every seconds and update state
    // assign interval function given line,
    // update state by this line
    if (line && !line.interval) {
      line.interval = setInterval(() => {
        line.counter += 1;
        this.setState(previousState => ({
          lines: [...previousState.lines.filter(linex => linex.callUUID !== line.callUUID), line],
          // if activeline exists and it is equal the line update it
          // if not exists set as activeLine
          activeLine: (previousState.activeLine) ? (
            (previousState.activeLine.callUUID === line.callUUID) ?
              line : previousState.activeLine
          ) : line
        }));
      }, 1000);
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linex => linex.callUUID !== line.callUUID), line],
        activeLine: (previousState.activeLine) ? (
          (previousState.activeLine.callUUID === line.callUUID) ?
            line : previousState.activeLine
        ) : line
      }));
    }
  }


  changeLine = (line) => {
    // make given line active and hold activeLine
    if (line) {
      if (line.onHold) {
        line.uaSession.unhold();
        line.onHold = false;
      }
      const activeLine = this.state.activeLine;
      console.log("line", line, "act", activeLine)
      if (!activeLine.hold) {
        activeLine.uaSession.hold();
        activeLine.onHold = true;
      }
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linex => linex.callUUID !== line.callUUID || linex.callUUID !== activeLine.callUUID), activeLine, line],
        activeLine: line,
      }));

    }
  }

  startCall = (to) => {
    const callUUID = uuidv4();
    console.log('Dialing number: ' + to);
    let number;
    number = decodeURIComponent(to).replace(' ', '');
    number = to.replace('%2B', '').replace('%2b', '');
    number = to.toLowerCase();
    number = number.replace(/[^0-9+]+/g, '');
    if (number.indexOf('+') > 0) {
      number = '00' + number;
    }
    // TODO do crm query
    var line = {
      connectedName: '',
      connectedNumber: number,
      counterTimeout: false,
      proxTimeout: false,
      counter: 0,
      inCall: false,
      inConnectedCall: false,
      incomingCall: false,
      stagingTransfer: false,
      onHold: false,
      muted: false,
      uaSession: false,
      callUUID
    };
    line.uaStatus = SIP_STATUS_CONNECTING;
    var extraHeaders = [];
    if (this.fromNumber !== 'default') {
      extraHeaders = ['X-CallFrom: ' + this.fromNumber];
    }
    try {
      line.uaSession = this.ua.invite(number, {
        extraHeaders: extraHeaders,
        // sessionDescriptionHandlerOptions: {
        //   constraints: {
        //     audio: true,
        //     video: false
        //   }
        // }
      });
    } catch (err) {
      console.log("and err", err)
    }
    //line.uaSession.errorListener((a) => {console.log("error", a)})
    console.log("session", line.uaSession)

    line.uaSession.callUUID = callUUID;
    this.props.history.push(`/webapp/activecalls/${callUUID}`)
    line.connectingCall = true;

    const holdedLines = this.state.lines.map(linex => {
      if (linex.callUUID !== line.callUUID && !linex.onHold)
        linex.uaSession.hold()

      linex.onHold = true;
      return linex;
    });
    this.setState(previousState => ({
      lines: [...holdedLines, line],
      activeLine: line,
    }), () => {
      this.setupSessionListeners(line.uaSession);
      this.startRinging(line);
    });
  }

  answerCall = (line) => {
    if (line.uaSession) {
      this.setState({
        activeLine: line
      })
      line.uaSession.accept({
        // sessionDescriptionHandlerOptions: {
        //   constraints: {
        //     audio: true,
        //     video: false
        //   }
        // }
      });
      (async () => {
        if (line && line.ringing) {
          ringingFX.stop();
          clearInterval(line.ringing);
        }
        if (line && line.incomingRinging) {
          incomingRingingFX.stop();
          clearInterval(line.incomingRinging);
        }
      })();
      this.props.history.push(`/webapp/activecalls/${line.callUUID}`)
      this.startCounter(line);
    }
  }

  rejectCall = (line) => {
    if (line) {
      (async () => {
        if (line && line.ringing) {
          ringingFX.stop();
          clearInterval(line.ringing);
        }
        if (line && line.incomingRinging) {
          incomingRingingFX.stop();
          clearInterval(line.incomingRinging);
        }
      })();
      if (line.uaSession) {
        console.log("Rejecting line", line);
        // line.uaSession.terminate();
        if (line.inCall)
          line.uaSession.bye();
        else if (line.incomingCall)
          line.uaSession.reject();
        else
          line.uaSession.cancel();

        this.setState({
          activeLine: null,
          lines: this.state.lines.filter(linec => linec.callUUID !== line.callUUID)
        });
      }

    }
  }

  /*
   @deprecated
  transferCall = (line, to, attended = false) => {
    if (line.uaSession) {
      console.log(`transfer call ${line.callUUID} to ${to}`);
      line.uaSession.refer(to, {
        'extraHeaders': [
          `Referred-By: <${sip_uri}>`
        ]
      });
    }
  }
  */
  transferCall = (line, to, attended = true) => {
    if (line.uaSession) {
      console.log(`transfer call ${line.callUUID} to ${to}`);
      line.uaSession.refer(to, {
        'extraHeaders': [
          `Referred-By: <${sip_uri}>`
        ]
      });
    }
  }

  sendDtmf = (digit, line) => {
    // send dtmf to line
    // if line given use it else use the activeLine
    if (line) {
      if (line.uaSession) {
        line.uaSession.dtmf(digit);
      }
    } else {
      if (this.state.activeLine) {
        this.state.activeLine.uaSession.dtmf(digit);
      }
    }
  }

  toggleMute = (session, mute) => {
    var pc = session.sessionDescriptionHandler.peerConnection;
    if (pc.getSenders) {
      pc.getSenders().forEach(function (sender) {
        if (sender.track) {
          sender.track.enabled = !mute;
        }
      });
    } else {
      pc.getLocalStreams().forEach(function (stream) {
        stream.getAudioTracks().forEach(function (track) {
          track.enabled = !mute;
        });
        stream.getVideoTracks().forEach(function (track) {
          track.enabled = !mute;
        });
      });
    }
  };

  muteCall = (line) => {
    if (!line.muted) {
      console.log('Muting...');
      line.muted = true;
      this.toggleMute(line.uaSession, line.muted);
    }
    else {
      console.log('Unmuting...');
      line.muted = false;
      this.toggleMute(line.uaSession, line.muted);
    }
    this.setState((previousState) => ({
      lines: [...previousState.lines.filter(linec => linec.callUUID !== line.callUUID), line],
      activeLine: line,
    }))
    //});
  };

  holdSession = (line) => {
    if (!line.onHold) {
      console.log("holdingg");
      line.uaSession.hold();
      line.onHold = true;
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linec => linec.callUUID !== line.callUUID), line],
        // if activeline exists and it is equal the line update it
        // if not exists set as activeLine
        activeLine: (previousState.activeLine) ? (
          (previousState.activeLine.callUUID === line.callUUID) ?
            line : previousState.activeLine
        ) : line
      }));
    } else {
      const callId = line.callUUID;
      console.log("Unholding", callId);
      line.uaSession.unhold();
      line.onHold = false;
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linec => linec.callUUID !== callId), line],
        // if activeline exists and it is equal the line update it
        // if not exists set as activeLine
        activeLine: (previousState.activeLine) ? (
          (previousState.activeLine.callUUID === callId) ?
            line : previousState.activeLine
        ) : line
      }));

    }

  }

  timeoutFn = (fn, timeout, _id = 'default') => {
    console.log("tm");
    const newTimeout = setTimeout(() => { fn() }, timeout);
    this.timeouts.push({ _id, timeoutObj: newTimeout });
  }

  intervalFn = (fn, interval, _id = 'default') => {
    const newInterval = setInterval(() => { fn() }, interval);
    this.intervals.push({ _id, intervalObj: newInterval });
  }


  removeLineBySession = (session) => {
    const line = this.state.lines.find(linec => linec.callUUID === session.callUUID);
    const linesButThis = this.state.lines.filter(linec => linec.callUUID !== session.callUUID);
    if (line)
      if (line.interval)
        clearInterval(line.interval)

    let newActiveLine;
    // if activeline is this line remove it and assign new line from lines if exists
    // if activeline is not this line leave it be
    if (this.state.activeLine) {
      if (this.state.activeLine.callUUID === session.callUUID) {
        if (linesButThis.length > 0) {
          newActiveLine = linesButThis[0];
        } else {
          newActiveLine = null;
        }
      } else {
        newActiveLine = this.state.activeLine;
      }
    } else {
      if (linesButThis.length > 0) {
        newActiveLine = linesButThis[0];
      } else {
        newActiveLine = null;
      }
    }

    this.setState({
      lines: this.state.lines.filter(linec => linec.callUUID !== session.callUUID),
      activeLine: newActiveLine ? Object.assign({}, newActiveLine, { onHold: false }) : null,
    }, () => {
      // if the line closed and current path has the closed line's uuid
      // remove it, else get the first call and make the url's uuid to that call
      if (this.props.history.location.pathname.indexOf(session.calllUUID) > 0) {
        let sortedLines = [];
        if (this.state.lines.length < 2) {
          sortedLines = this.state.lines;
        } else {
          sortedLines = this.state.lines.sort((a, b) => { return a.callUUID > b.callUUID });
        }
        if (sortedLines && sortedLines.length > 0) {
          const activeLine = sortedLines[0];
          activeLine.uaSession.unhold()
          this.props.history.push(`/webapp/activecalls/${activeLine.callUUID}/`);
        }
        else {
          this.props.history.push(`/webapp/calls/contacts`);
        }

      }
      console.log("history", this.props.history)
    })
  }

  setupSessionListeners = (session) => {
    const currentLine = this.state.lines.find(line => line.callUUID === session.callUUID);
    var setupRemoteMedia = () => {

      // If there is a video track, it will attach the video and audio to the same element
      var pc = session.sessionDescriptionHandler.peerConnection;
      console.log("setup remote", pc)
      ringingFX.stop();
      var remoteStream;

      if (pc.getReceivers) {
        if (!!session.hasAddedMedia) {
          remoteStream = this.remoteMedia.srcObject;
        } else {
          remoteStream = new window.MediaStream();
        }
        pc.getReceivers().forEach(function (receiver) {
          var track = receiver.track;
          if (track) {
            remoteStream.addTrack(track);
          }
        });
      } else {
        remoteStream = pc.getRemoteStreams()[0];
      }
      this.remoteMedia.srcObject = remoteStream;
      this.remoteMedia.autoplay = true;
      // console.log('remotestream', remoteStream);
      /* this.remoteMedia.play().catch(function () {
        console.log('play was rejected');
      });
      session.hasAddedMedia = true;
      */
    };

    /*
    var setupLocalMedia = () => {

      var pc = session.sessionDescriptionHandler.peerConnection;
      console.log("setupLocal", pc)
      var localStream;
      if (pc.getSenders) {
        localStream = new window.MediaStream();
        pc.getSenders().forEach(function (sender) {
          var track = sender.track;
          if (track) {
            localStream.addTrack(track);
          }
        });
      } else {
        localStream = pc.getLocalStreams()[0];
      }
      this.localMedia.srcObject = localStream;
      this.localMedia.volume = 0;
      // console.log('localstream', localStream);
      this.localMedia.play().catch(function () {
        console.log('play was rejected');
      });
    };
    */

    session.on('accepted', (data) => {
      if (session.callNotifId) {
        hideCallNotification(session.callNotifId);
        session.callNotifId = null;
      }
      if (currentLine) {
        window.sip_session = session;
        currentLine.uaStatus = 'Çağrıda...';
        currentLine.inCall = true;
        currentLine.incomingCall = false;
        currentLine.inConnectedCall = true;
        try {
          currentLine.connectedName = session.remoteIdentity.displayName.replace(/[^\w\s]/gi, '');
        }
        catch (e) {
          currentLine.connectedName = '';
        }
        currentLine.connectedNumber = session.remoteIdentity.uri.user;
        this.startCounter(currentLine);
        // TODO CHange active to this line and hold others

        this.setState(state => {
          console.log("setting state")
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID);
          const holdedLines = prevLinesButThis.map(linex => {
            if (!linex.onHold)
              linex.uaSession.hold()
            linex.onHold = true;
            return linex;
          });
          return {
            lines: [...holdedLines, currentLine],
            // activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
            activeLine: currentLine,
          }
        });
      }
    });
    session.on('rejected', (response, cause) => {
      ringingFX.stop();
      console.log('Call Rejected!');
      if (session.callNotifId) {
        hideCallNotification(session.callNotifId);
        session.callNotifId = null;
      }
      if (currentLine) {
        currentLine.uaStatus = 'Rejected';
        currentLine.inCall = false;
        currentLine.inConnectedCall = false;
        currentLine.incomingCall = false;
        /*
        this.setState(state => {
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID)
          return {
            lines: [...prevLinesButThis, currentLine],
            activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
          }
        });
        */
        this.removeLineBySession(session);

      }
    });
    session.on('connecting', () => {
      console.log('Call Connecting!');
      if (session.callNotifId) {
        hideCallNotification(session.callNotifId);
        session.callNotifId = null;
      }
      if (currentLine) {
        currentLine.uaStatus = 'Connecting';
        this.setState(state => {
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID)
          return {
            lines: [...prevLinesButThis, currentLine],
            activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
          }
        });

      }
      // this.pauseIncomingRing(); // stop incoming ring due to Chrome 52 connecting lag
    });
    session.on('cancel', () => {
      ringingFX.stop();
      console.log('Call Cancelled!');
      if (session.callNotifId) {
        console.log("remove notiff on cancel");
        hideCallNotification(session.callNotifId);
        session.callNotifId = null;
      }
      currentLine.uaStatus = 'Canceled';
      if (currentLine) {
        currentLine.inCall = false;
        currentLine.connectingCall = false;
        currentLine.inConnectedCall = false;
        currentLine.incomingCall = false;
        /*
        this.setState(state => {
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID)
          return {
            lines: [...prevLinesButThis, currentLine],
            activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
          }
        });
        */
      }
      this.removeLineBySession(session);
    });
    session.on('progress', (response) => {
      console.log('Call Progress!', currentLine);
      if (currentLine) {
        if (!currentLine.incomingCall) {
          currentLine.uaStatus = 'Çalıyor...';
        }
        if (!currentLine.connectedName) {
          currentLine.connectedName = '...';
        }
        currentLine.inCall = false;
        currentLine.incomingCall = false;
        currentLine.connectingCall = false;
        this.setState(state => {
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID)
          return {
            lines: [...prevLinesButThis, currentLine],
            activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
          }
        });
      };
    });
    session.on('bye', () => {
      console.log('Call Disconnected!');
      if (session.callNotifId) {
        console.log("remove notiff on bye");
        hideCallNotification(session.callNotifId);
        session.callNotifId = null;
      }
      if (currentLine) {
        currentLine.uaStatus = 'Disconnected';
        currentLine.inCall = false;
        currentLine.connectingCall = false;
        currentLine.inConnectedCall = false;
        currentLine.incomingCall = false;
        /*
        this.setState(state => {
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID)
          return {
            lines: [...prevLinesButThis, currentLine],
            activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
          }
        });
      */
      };
      this.removeLineBySession(session);
    });
    session.on('failed', (req, cause) => {
      console.log("failed", req, cause)
      if (cause === "WebRTC Error") {
        /*
        store.addNotification({
            title: "Hatalı İşlem!",
            message: "Mikrofon ayarlarınızı kontrol edin. Çağrı başarısız!",
            type: "warning",
            insert: "top",
            container: "top-center",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
                duration: 5000,
                onScreen: true
            }
        });
        */ // custom error
        console.log("web rtc  error");
      }
      if (session.callNotifId) {
        console.log("remove notiff on failed");
        hideCallNotification(session.callNotifId);
        session.callNotifId = null;
      }
      hideCallNotification(session.callNotifId);
      if (currentLine) {
        currentLine.inCall = false;
        currentLine.connectingCall = false;
        currentLine.inConnectedCall = false;
        currentLine.incomingCall = false;
        /*

        this.setState(state => {
          const prevLines = state.lines;
          const prevLinesButThis = prevLines.filter(line => line.callUUID !== session.callUUID)
          return {
            lines: [...prevLinesButThis, currentLine],
            activeLine: (state.activeLine && state.activeLine.callUUID === currentLine.callUUID) ? currentLine : state.activeLine,
          }
        });
        */
      };
      this.removeLineBySession(session);
    });
    session.on('refer', (request) => {
      console.log('New Call Transfer!');
      //session.followRefer();
      //session.bye();
    });
    // session.on('referRejected', ())
    //session.on('referred', function (request, newSession) {
    //  console.log('Call Transferred!');
    //});

    // session.sessionDescriptionHandler.on('addTrack', function() {
    //   console.log('A track has been added, triggering new remoteMedia setup');
    //   // setupRemoteMedia();
    // }.bind(this));
    //
    // session.sessionDescriptionHandler.on('addStream', function() {
    //   console.log('A stream has been added, trigger new remoteMedia setup');
    //   // setupRemoteMedia();
    // }.bind(this));

    session.on('trackAdded', () => {
      console.log("async track");
      setupRemoteMedia();
      //
      //   var remoteVideo = document.getElementById('remoteVideo');
      //   var localVideo = document.getElementById('localVideo');
      //
      //   var pc = session.sessionDescriptionHandler.peerConnection;
      //
      //   // Gets remote tracks
      //   var remoteStream = new MediaStream();
      //   pc.getReceivers().forEach(function(receiver) {
      //     remoteStream.addTrack(receiver.track);
      //     console.log('remote stream');
      //   });
      //   remoteVideo.srcObject = remoteStream;
      //   remoteVideo.play();
      //   var localStream = new MediaStream();
      //   pc.getSenders().forEach(function(sender) {
      //     localStream.addTrack(sender.track);
      //     console.log('local stream');
      //   });
      //   localVideo.srcObject = localStream;
      //   localVideo.play();
    });
    session.on('dtmf', (dtmf, request) => {
      console.log('Call DTMF Received!');
    });
    /*
    session.mediaHandler.on('userMediaFailed', function() {
      console.error("Get user media FAILED");
      try {
        //stop(_ui.audio.ringing);
        //play(_ui.audio.error, false);
      }
      catch(e) {
        console.error(e);
      }

      //removeMicRequest();
      //activateDisconnectedUI();

      //setTimeout(function() {
      //  alert(trans('er', 'mic_disabled'));
      //}, 1500);
    });

    
    session.mediaHandler.on('iceFailed', function() {
      alert("We couldn't connect your call because we couldn't retrive your audio settings. Please contact us at support@toky.co for help.");
      //play(_ui.audio.error);
      //if (_data.session)
        session.bye();
    });
    */
  };

  openNavigatorNotification = async (line) => {
    // TODO serviceworker dont work ? @ umut
    if (!("Notification" in window)) {
      console.error("notifications are not supported");
      return;
    }
    if (Notification.permission !== 'denied') {
      navigator.serviceWorker.ready.then(registration => {
        var options = {
          body: `${line.connectedName} - ${line.connectedNumber}`,
          tag: `${line.callUUID}`,
          icon: "https://mobikob.com/static/img/mobi_512.png",
          actions: [
            {
              action: 'answer_action',
              title: '✔️ Cevapla',
              icon: ''
            },
            {
              action: 'hangup_action',
              title: '🚫 Kapat',
              icon: ''
            },
          ]
        };
        console.log("options", options)
        registration.showNotification(`☎️ Yeni çağrı!`, options)
          .then(() => registration.getNotifications())
          .then(notifications => {
            setTimeout(() => notifications.forEach(notification => notification.close()), 15000);
          });
      });


      /*
      notif = reg.showNotification(`☎️ Yeni çağrı!`, options);
      setBrowserNotif(notif);
      notif.onclick = function () {
          window.focus();
          notif.close();

      };

      notif.onshow = function () {
          setTimeout(function () { notif.close(); }, 15000);
      };
      */
    }
    navigator.serviceWorker.addEventListener('message', function (event) {
      // do some work here
      console.log("click notification for " + event.data)
      if (event.data === "answer_action") {
        window.focus();
        this.answerCall(line);
      }
      if (event.data === "hangup_action") {
        this.rejectCall(line);
      }

    });
  }

  closeNavigatorNotification = (line) => {
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications()
        .then(notifications => {
          notifications.forEach(notification => {
            console.log("closeing notif", notification);
            // if notificaiton present and a call notif than close
            if (notification.tag && notification.tag === line.callUUID) {
              notification.close();
            }
          })
        })
    })
  }


  openCallNotificationWrapper = (line) => {
    this.openNavigatorNotification(line);
    openCallNotification(line, this.answerCall, this.rejectCall, this.closeNavigatorNotification);
  }

  refreshUA = () => {
    if (this.ua) {
      this.ua.stop();
      this.ua.unregister();
      this.ua = null;
    }
    this.createUA();
  }

  createUA = () => {
    if (this.ua) {
      return;
    }
    // create user agent for sip js
    const { extension, extension_pass, tenant } = this.props.user;
    // let extension = '305';
    // let extension_pass = '1r0uhzta';
    // let tenant = 'sahra';
    if (!extension || !extension_pass) {
      console.log("Couldnt find extension info");
      return
    }
    if (!this.ua) {
      console.log("not ua new ua");
      this.ua = window.ua = new SIP.UA({
        uri: `sip:${extension}@${tenant}.${sip_uri}`,
        wsServers: wss_servers,
        register: true,
        // wsServers: [ws_server],
        log: {
          builtinEnabled: false
        },
        authorizationUser: extension,
        password: extension_pass,
        noAnswerTimeout: 120,
        contactName: `${extension}`,
        transportOptions: {
          wsServers: wss_servers,
          traceSip: true
        },
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: true,
            video: false
          },
          alwaysAcquireMediaFirst: true,
          peerConnectionOptions: {
            rtcConfiguration: {
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                {
                  urls: "turn:turn-ip:443?transport=tcp",
                  username: "turnuser",
                  credential: "turnpass"
                }
              ]
            },
            iceCheckingTimeout: 200,
          }
        }

      });
    }
    /*
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: false
        },
        alwaysAcquireMediaFirst: true
      },
      */

    const { ua } = this;
    console.log("ua stat", ua.status)
    /*
    ua.transport.on('connecting', () => {
      this.setState({
        transportStatus: TS_STATUS_CONNECTING,
      });
    });

    ua.transport.on('disconnected', () => {
      this.setState({
        transportStatus: TS_STATUS_DISCONNECTED,
      });
    });

    ua.transport.on('connected', () => {
      this.setState({
        transportStatus: TS_STATUS_CONNECTED,
      });
    });

    ua.transport.on('transportError', (e) => {
      console.log("error", e)
      this.setState({
        transportStatus: TS_STATUS_ERROR,
      })

    })
    */

    ua.on('connected', () => {
      console.log('SIP User Agent Connected');
      this.setState({
        sipStatus: SIP_STATUS_CONNECTED,
      })
    });

    ua.on('disconnected', () => {
      console.log('SIP User Agent Disconnected');
      this.setState({
        sipStatus: SIP_STATUS_DISCONNECTED,
      })
    });

    ua.on('registered', () => {
      ///this.registerPresence('303');
      console.log('SIP User Agent Registered');
      if (this.state.sipStatus !== SIP_STATUS_REGISTERED)
        this.setState({
          sipStatus: SIP_STATUS_REGISTERED,
        })
    });

    ua.on('unregistered', function (cause) {
      console.log('SIP User Agent UNregistered');
    });

    ua.on('registrationFailed', (cause) => {
      console.log('registration failure error ', cause);
      console.log('SIP User Agent Registration Failure');
      this.setState({
        sipStatus: SIP_STATUS_ERROR,
        sipErrorMessage: cause ? `${cause.status_code}, ${cause.reason_phrase}` : `Bilinmeyen`
      })
    });

    ua.on('invite', (session) => {
      const callUUID = uuidv4();
      var inviteTimeout = false;
      if (inviteTimeout) {
        return false;
      }
      else {
        inviteTimeout = setTimeout(function () {
          clearTimeout(inviteTimeout);
          inviteTimeout = false;
        }, 2000);
      }
      console.log('Incoming Call!');
      console.log("")
      session.callUUID = callUUID;
      const line = {
        connectedName: '',
        connectedNumber: '',
        incomingCall: false,
        inConnectedCall: false,
        recording: false,
        inCall: false,
        onHold: false,
        muted: false,
        counter: 0,
        uaSession: session,
        callUUID,
      }
      line.uaStatus = CALL_STATUS_RINGING;
      line.incomingCall = true;
      try {
        line.connectedName = session.remoteIdentity.displayName.replace(/[^\w\s]/gi, '');
      }
      catch (e) {
        line.connectedName = 'Talking';
      }
      line.connectedNumber = session.remoteIdentity.uri.user;

      // currentLine = line;
      this.startIncomingRinging(line);
      /*
      const callNotifId = store.addNotification({
        content: (
          <IncomingCallNotification
            line={line}
            answerCall={this.answerCall}
            rejectCall={this.rejectCall}
          />
        ),
        type: "success",
        insert: "top",
        container: "top-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          click: false,
          duration: 30000,
        }
      })
      */
      this.openCallNotificationWrapper(line);
      session.callNotifId = line.callUUID;
      this.setState(previousState => ({
        lines: [...previousState.lines.filter(linex => linex.callUUID !== line.callUUID), line],
        activeLine: previousState.activeLine ? previousState.activeLine : line,
      }));
      this.setupSessionListeners(session);
    });


  }
  isConnected = () => {
    if (this.state.sipStatus === SIP_STATUS_DISCONNECTED || this.state.sipStatus === SIP_STATUS_ERROR || this.state.transportStatus === TS_STATUS_ERROR) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <SipContext.Provider
        value={{
          ...this.pros,
          status: this.state.sipStatus,
          transportStatus: this.state.transportStatus,
          errorType: this.state.sipErrorType,
          errorMessage: this.state.sipErrorMessage,
          lines: this.state.lines,
          activeLine: this.state.activeLine,
          answerCall: this.answerCall,
          rejectCall: this.rejectCall,
          startCall: this.startCall,
          stopCall: this.stopCall,
          muteCall: this.muteCall,
          sendDtmf: this.sendDtmf,
          transferCall: this.transferCall,
          holdSession: this.holdSession,
          changeLine: this.changeLine,
          retryRegister: this.refreshUA, // use with caution @umut
        }}
      >
        {this.props.children}
      </SipContext.Provider>

    )
  }

}
export default withRouter(SipProvider);
