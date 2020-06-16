import firebase from 'firebase/app';
import '@firebase/messaging';

const config = {
    apiKey: "AIzaSyAXDQ5EPKgB0oK08uqwXgvMBEkCIboNgsM",
    authDomain: "mobikob.firebaseapp.com",
    databaseURL: "https://mobikob.firebaseio.com",
    projectId: "mobikob",
    storageBucket: "mobikob.appspot.com",
    messagingSenderId: "379890795216",
    appId: "1:379890795216:web:22b2bcf46f865735a1d4d5",
    measurementId: "G-ZZ4K7T9B2X"
};

firebase.initializeApp(config);

// initialize messaging
let messaging;
if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
} else {
    console.log("messaging is not suppported?")
}

if (messaging)
    messaging.usePublicVapidKey(
        "BAZZdGuF0QvAvl2LeDfs151_ZcZKhftuENvpEOV9T65yIfQWlEjDjzuU371j4ef1Q9wfQ1kptKN9smt13hFmA-s"
    );

messaging.onMessage(payload => {
    console.log("Notification Received", payload);
    //this is the function that gets triggered when you receive a 
    //push notification while you’re on the page. So you can 
    //create a corresponding UI for you to have the push 
    //notification handled.
});

/// register service worker & handle push events
export {
    messaging
};

