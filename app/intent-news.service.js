"use strict";

const http = require("request-promise-native");

exports.fulfill = function(sendResponse) {
    const url = 'http://www.kreamont.at/wp-json/wp/v2/posts?per_page=1';    
    http.get({ json: true, uri: url }).then(function(news) {
        if (news.length <= 0) {
            sendResponse('Leider hab ich keine Neuigkeiten gefunden');
            return;
        }
        sendResponse(news[0].title.rendered);
    });
};