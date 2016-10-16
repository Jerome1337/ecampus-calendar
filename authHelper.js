'use strict';

let clientId = '6b3c23c8-73e0-4524-90d6-695666c6c8af';
let clientSecret = 'u1CmxT8OFmcE1rpeQYfgpku';
let redirectUri = 'http://localhost:3000/authorize';

let scopes = [
    'openid',
    'profile',
    'offline_access',
    'https://outlook.office.com/calendars.readwrite'
];

const credentials = {
    client: {
        id: clientId,
        secret: clientSecret
    },
    auth: {
        tokenHost: 'https://login.microsoftonline.com',
        tokenPath: '/common/oauth2/v2.0/token',
        authorizePath: '/common/oauth2/v2.0/authorize'
    }
};

const oauth2 = require('simple-oauth2').create(credentials);

module.exports = {
    getAuthUrl: function () {
        return oauth2.authorizationCode.authorizeURL({
            redirect_uri: redirectUri,
            scope: scopes.join(' '),
            state: '3(#0/!~',
        });
    },

    getTokenFromCode: function (auth_code, callback, response) {
        oauth2.authorizationCode.getToken({code: auth_code, redirect_uri: redirectUri})
            .then((result) => {
                const token = oauth2.accessToken.create(result);
                callback(response, null, token);
            })
            .catch((error) => {
                callback(response, error, null);
            })
    }
};
