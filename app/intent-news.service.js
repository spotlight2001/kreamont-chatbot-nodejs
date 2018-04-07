"use strict";

const http = require("request-promise-native");

exports.fulfill = function (sendResponse) {
    const url = 'http://www.kreamont.at/wp-json/wp/v2/posts?per_page=1';
    http.get({ json: true, uri: url }).then(function (news) {
        let text = undefined
        if (news.length <= 0) {
            text = 'Leider hab ich keine Neuigkeiten gefunden';
        } else {
            text = news[0].title.rendered;
        }
        let result = {
            fulfillmentMessages: [
                {
                    "card": {
                        "title": "News von der Homepage",
                        "subtitle": text,
                        "buttons": [
                            {
                                "text": "Zur Homepage",
                                "postback": "https://www.kreamont.at/"
                            }
                        ]
                    }
                }
            ]
        };
        sendResponse(result);
    });
};