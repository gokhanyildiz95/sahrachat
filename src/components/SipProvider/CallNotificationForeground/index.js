import React from 'react';
import { Button, notification } from 'antd';

export const hideCallNotification = (key) => {
    notification.close(key);
}

const openCallNotification = (line, answerCall, rejectCall, closeNavigatorNotification) => {
    const key = line.callUUID;
    const close = () => {
        console.log(
            'Notification was closed. Either the close button was clicked or duration time elapsed.',
        );
        rejectCall(line);
        closeNavigatorNotification(line);
    };
    const btn = (
        <div style={{ paddingRight: "5px" }}>
            <Button type="primary" size="large" onClick={() => { notification.close(key); answerCall(line); }}>
                Cevapla
        </Button>
            <Button type="danger" size="large" onClick={() => { notification.close(key); rejectCall(line); }}>
                Kapat
        </Button>
        </div>
    );
    var options = {
        body: `${line.connectedName} - ${line.connectedNumber}`,
        tag: `${line.callUUID}`,
        icon: "https://mobikob.com/static/img/mobi_512.png",
    };
    var naviNotification = new Notification(`☎️ Yeni çağrı!`, options);
    naviNotification.onclick = function () {
        window.focus();
    };
    notification.open({
        message: `☎️ Yeni çağrı!`,
        description: `${line.connectedName} - ${line.connectedNumber}`,
        duration: 35,
        btn,
        key,
        onClose: close,
    });
};

export default openCallNotification;