const registerServiceWorker = () => {
  console.log("registeringg")
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(function(registration) {
          console.log("Registration successful, scope is:", registration.scope);
        })
        .catch(function(err) {
          console.log("Service worker registration failed, error:", err);
        });
    }
  };
export { registerServiceWorker };
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        const registration = await navigator.serviceWorker.register('/mobikob-sw.js', {
            updateViaCache: 'none'
        });
		console.log("mess", messaging,"reg",registration);
        messaging.useServiceWorker(registration);
        messaging.onMessage((payload) => {
			console.log("not bgpayloaddd", payload);
            const title = payload.notification.title;
            const options = {
                body: payload.notification.body,
                icon: payload.notification.icon,
                sound: "https://mobikob.com/static/sound/new-mess-notif-on-focus.mp3"
            };
            registration.showNotification(title, options);           
        });
		messaging.onTokenRefresh(() => {
			messaging.getToken().then((refreshedToken) => {
				console.log('Token refreshed.', refreshedToken);
				// Indicate that the new Instance ID token has not yet been sent to the
				// app server.
				// setTokenSentToServer(false);
				localStorage.setItem('INSTANCE_TOKEN', refreshedToken);
				// Send Instance ID token to app server.
				// sendTokenToServer(refreshedToken);
				// [START_EXCLUDE]
				// Display new Instance ID token and clear UI of all previous messages.
				//esetUI();
				// [END_EXCLUDE]
			}).catch((err) => {
				console.log('Unable to retrieve refreshed token ', err);
				//showToken('Unable to retrieve refreshed token ', err);
			});
		});
    });
}
*/