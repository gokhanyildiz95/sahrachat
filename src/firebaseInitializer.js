import firebase from 'firebase-admin';

const config = {
  pe: 'service_account',
  project_id: 'mobikob',
  private_key_id: '1380df9af0aaa7e7956e13f00c375369a98ebe45',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD1IkZY+2a4E4O/\nS5riH9E8wwu8pnx1Oj0wPeiTv4Ban/iWpn1alcMEckZaySHP07NH0vaBAmbG/FRf\nZvwx+/sNibBevD/YxdOTc/Ln1Hf8QN4YDccHEgC9t0iZ4XPsHBVeVhFaerBSPh8K\ns51Az9+PVszmI/+P6sbLcv/zE7Zpj1tXg7SqCzzpMucmOj8QAcoaecKKVLvOTY9T\nDCznqAThLK4Z/53xpei2sryGtcwFKEiJvdrc4fQDjRCjZ8B07NjSfzoFErooBQAq\nFMN8dw7Mw79zzLOE8bmx47VhSh7jYWV/UiCRMeWjJPruvAhCmLR3bjhfJT6/Ge/0\np1VbUn9DAgMBAAECggEAD8bm9C8qC0rmPdel3kvh8aE0Di5A8GKRMZuqbmfy4OJO\n45NPmhbteEnKkWlEjdW4QjUnvGHlL4VqAMHmFWl8XQCxo0dGbLM+zMy3o4gfONML\n+ExatO/JsGwtdgn2pgmgrnOnpkUjOAfbg5rP0i4O23Dguycx+ZdIuCtsob5xDRYW\nsZoDDA5ByC3VpoMMRs4+KMa7BdlgIl4K8s0GfwJAB7z+0TXj9RMSkgvTMXndhkrl\nNdrMOUeTwoSCe5JfjrQmhx1opJGFKJqcCFWjmrl4VSNpXgXHVNX0qOfGi27+tBha\nbHeImofOK917fZQkbImGWs/xOlmDfPJBen87eswyIQKBgQD8mwPIuBcYc6fcsUkf\nAxo+aj5kQRhF/sEq8WKSxeqEiptxshbyqOCunUBa6Dxxvl40n71afJN1ZuDXAdCQ\n59evFtAAA6T37/PgOdtv+9lVPVEKxiaBmSrqH7ZwYcfqsDp+E7409rxpykSOOJqU\nySyNH0uztP7UyL0DZhBXVGDTiQKBgQD4bY6R36q28Z8UY6m0BuzT+MQPOsRpcfM/\nELNbAn/GYLON16k8R7yhVGpqhcTLCH5dL0/h1+Hp6QHcpU0xq7B14sYu1u8r0Odz\ng9jzWAIqxnNnRPI4j1MpdvXUhcmw6r4eHWikd9bpuF3anxcDB+5YXPjhgZAHP7He\nEQj5SpMtawKBgQCEyqjOl5fsjsAr0Db0Spk9PnTWFzI/eZDqlkKPjeOfEY5t0oUl\nw4l5wcjXAUblNIIpf9/29Y4/JXoFDTsrMfW8YW2u1Dug6091DHVDBU5W9QjpdQlB\nD9fzhABQS9bglQvqw042YY7iviYT7cW1eZwmA9G0Au4DxhM2+iyU/BJ6oQKBgQDi\nlCGtQB9WvecGVKPKE2rbJg/DiCjtt0VQ5q1+uzfIuhfpraGn3hHX3sM0Jo9HUpbV\n7Lnh1OEyUxckpAtU2y+VRWDWBaicAOuoOr+bqlBHrTpCHOsC1Q3XSq2JyQAcgO0n\nUFFJeBemkUXgiKsXU5t6Mkm4e0/enKRgUo8pt2+mwwKBgQChWc19tCknMzlV0fwL\nC1htr8mJmAth1VT/01x4SJMvjS+PB9F+erCEP+kbF/H9MkiPJe0B7R9uwa6zv56P\n2Z+62EhbxTaCDA2RQ3KPVJf7QlyD8KmVf4hMD/G/q/RtG3ZoNWzR0BWqo9VgWk7I\nOgEuO73w0wH2r0ZbCtN5P6oGtQ==\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-s1nm7@mobikob.iam.gserviceaccount.com',
  client_id: '115899824202062854732',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-s1nm7%40mobikob.iam.gserviceaccount.com',
};


const fapp = firebase.initializeApp({
  credential: firebase.credential.cert(config),
  databaseURL: 'https://mobikob.firebaseio.com',
});
// const fdb = firebase.database();
// const ref = fdb.ref("mobikob");
// ref.once("value", function(snapshot) {
//   console.log("valuue", snapshot.val());
// });


export default fapp;
