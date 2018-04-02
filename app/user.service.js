"use strict";

exports.getUser = function (request) {
    console.log('try get user from request');
    const requestUserStr = request.body.originalDetectIntentRequest.payload.user;
    if (! requestUserStr) {
        return null;
    }
    const jwt = requestUserStr.idToken;
    if (! jwt) {
        return null;
    }
    const jsonStr = Buffer.from(jwt.split('.')[1], 'base64');
    console.log('user: ' + jsonStr);
    const user = JSON.parse(jsonStr);
    console.log('user email: ' + user.email);
    return user;
};