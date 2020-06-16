import axios from 'axios';
import { messaging } from './firebase';


notificationPermission = async () => {
    let permissionGranted = false;
    try {
        /* request permission if not granted */
        if (Notification.permission !== 'granted') {
            await messaging.requestPermission();
        }
        /* get instance token if not available */
        if (localStorage.getItem('INSTANCE_TOKEN') !== null) {
            permissionGranted = true;
        } else {
            const token = await messaging.getToken(); // returns the same token on every invocation until refreshed by browser
            // await this.sendTokenToDb(token);
            console.log("tooken", token);
            localStorage.setItem('INSTANCE_TOKEN', token);
            permissionGranted = true;
        }
    } catch (err) {
        console.log(err);
        if (err.hasOwnProperty('code') && err.code === 'messaging/permission-default') console.log('You need to allow the site to send notifications');
        else if (err.hasOwnProperty('code') && err.code === 'messaging/permission-blocked') console.log('Currently, the site is blocked from sending notifications. Please unblock the same in your browser settings');
        else console.log('Unable to subscribe you to notifications');
    } finally {
        return permissionGranted;
    }
}
