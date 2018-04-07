"use strict";

const Fuse = require('fuse.js');
const telefonlisteClient = require('./telefonliste.client');

let emailIndex = undefined;

function init() {
    telefonlisteClient.getPersons().then(function(persons) {
        emailIndex = new Fuse(persons, {
            shouldSort: false,
            threshold: 0.0,
            tokenize: false,
            matchAllTokens: true,
            keys: ['email']
        });

        let searchResultByEmail = emailIndex.search('waltermauritz@gmx.at');
        console.log('test search result by email: ' + JSON.stringify(searchResultByEmail));
        console.log('done indexing');
    }).catch(function(error) {
        console.error(error);
    });
};
init();

exports.getUser = function (request) {
    console.log('try get user from request');
    const requestUserStr = request.body.originalRequest.data.user;
    if (! requestUserStr) {
        console.warn('there is no user in originalRequest.data');
        return null;
    }
    const jwt = requestUserStr.idToken;
    if (! jwt) {
        console.warn('there is no JWT');
        return null;
    }
    console.log(`jwt: "${jwt}"`)
    const jsonStr = Buffer.from(jwt.split('.')[1], 'base64');
    console.log('user: ' + jsonStr);
    const user = JSON.parse(jsonStr);
    console.log('user email: ' + user.email);

    let persons = emailIndex.search(user.email);
    user.isKreamont = persons.length >= 0 || user.email === 'walter.mauritz@gmail.com';
    return user;
};