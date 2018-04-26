"use strict";

const Fuse = require('fuse.js');
const telefonlisteClient = require('./telefonliste.client');
const http = require('request-promise-native');

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

function createApplicationUser(user) {
    console.log('user email: ' + user.email);    
    let persons = emailIndex.search(user.email);
    let emailWhitelist = ['walter.mauritz@gmail.com', 'mauritz.annemarie@gmail.com'];
    user.isKreamont = persons.length >= 0 || emailWhitelist.some(user.email);
    return user;
}

exports.getUser = function (request) {
    return new Promise(function(resolve, reject) {
        console.log('try get user from request');
        const requestUserStr = request.body.originalRequest && request.body.originalRequest.data.user;
        if (! requestUserStr) {
            console.warn('there is no user in originalRequest.data');
            resolve(null);
        }
        const idToken = requestUserStr.idToken;
        console.debug('idToken: ' + idToken);
        const accessToken = requestUserStr.accessToken;
        console.debug('accessToken: ' + accessToken);
        if (! idToken) {
            if (! accessToken) {
                console.warn('there is no idToken, nor accessToken');
                resolve(null);
            }
    
            // use accessToken
            http.get('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + accessToken)
            .then(function(user) {
                resolve(createApplicationUser(user));
            }).catch(function(error) {
                console.error(error);
                reject(error);
            });
            return;
        }
        const jsonStr = Buffer.from(idToken.split('.')[1], 'base64');
        console.log('user: ' + jsonStr);
        const user = JSON.parse(jsonStr);        
        resolve(createApplicationUser(user));
    });
};