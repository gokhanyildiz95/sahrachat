import React from 'react';
import { withRouter } from 'react-router-dom';
import './CallNotification.css';

export const IncomingCallNotification = (props) => {
    const { line, answerCall, rejectCall, history } = props;
    const [browserNotif] = React.useState(null);
    console.log("icn", history)

    const notifyIncomingCall = async (actions) => {
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
    }

    React.useEffect(() => {
        notifyIncomingCall("Incoming call");
        navigator.serviceWorker.addEventListener('message', function (event) {
            // do some work here
            console.log("click notification for " + event.data)
            if (event.data === "answer_action") {
                window.focus();
                answerCall(line);
            }
            if (event.data === "hangup_action") {
                rejectCall(line);
            }

        });
        return function cleanup(){
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
    })
    const updateNotif = (isAnswered) => {
        console.log("update Notif", browserNotif);
        if (browserNotif) {
            if (!isAnswered) {
                browserNotif.close();
            }
        }

    }

    return (

        <div className="notif">
            <div className="notif-container">
                <div className="notif-title">
                    <span className="text">
                        Yeni Çağrı!
                    </span>
                </div>
                <div className="body">
                    <div className="icon-wrapper">
                        <i className="callfa">#</i>
                    </div>
                    <div className="caller-info">
                        <div className="callerNumber">
                            {line.connectedNumber}
                        </div>
                        <div className="callerName">
                            {line.connectedName}
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <div className="action-wrapper">
                        <button className="n-btn" onClick={() => { updateNotif(true); answerCall(line); }}>
                            <span className="label">
                                CEVAPLA
                            </span>
                        </button>
                    </div>
                    <div className="action-wrapper">
                        <button className="n-btn--danger" onClick={() => { updateNotif(false); rejectCall(line) }}>
                            KAPAT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default withRouter(IncomingCallNotification);