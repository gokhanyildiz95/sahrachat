/* The app will be in tenant's webapp page so we need to use
* the tenants domain.
*
*/

const PROTOCOL = window.location.protocol;
module.exports = {
    WS_URL: PROTOCOL === 'https:' ? `wss://${window.location.host}/graphql` : `ws://${window.location.host}/graphql`,
    GQ_URL: `${window.location.origin}/gql`,
    MEMBER_URL: `${window.location.origin}/member`,
    LOGIN_URL: `${window.location.origin}/member/login`,
    FB_URL: `${window.location.origin}/fb`,
    TENANT_ROOT: 'mobikob.com',
    NODEJS_URL: `${window.location.origin}/chat`
}
/*
module.exports = {
    GQ_URL: 'http://localhost:9000/gql',
    WS_URL: 'ws://localhost:9000/graphql',
    MEMBER_URL: `http://localhost:9000/member`,
    LOGIN_URL: `http://localhost:9000/member/login`,
    FB_URL: `http://localhost:9000/fb`,
}
*/