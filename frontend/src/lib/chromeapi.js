function getCookies() {
    chrome.cookies.getAll({ domain: 'mobikob.com', name: 'sessionid' },
        function (cookies) {
            if (cookies) return cookies;
            return null;
        }
    );
}