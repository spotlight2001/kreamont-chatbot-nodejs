"use strict";

const http = require("request-promise-native");

exports.fulfill = function (sendResponse) {
    const url = 'http://www.kreamont.at/wp-json/wp/v2/posts?per_page=1';
    http.get({ json: true, uri: url }).then(function (news) {
        let text = undefined
        if (news.length <= 0) {
            sendResponse('Leider hab ich keine Neuigkeiten gefunden');
        }
        let info = news[0];
        let result = {
            fulfillmentMessages: [{
                'platform': 'ACTIONS_ON_GOOGLE',
                'simple_responses': {
                    'simple_responses': [
                        {
                            'text_to_speech': 'Spoken simple response',
                            'display_text': 'Displayed simple response'
                        }
                    ]
                }
            }, {
                'platform': 'ACTIONS_ON_GOOGLE',
                'basic_card': {
                    'title': 'Title: this is a title',
                    'subtitle': 'This is an subtitle.',
                    'formatted_text': 'Body text can include unicode characters including emoji 📱.',
                    'image': {
                        'image_uri': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
                    },
                    'buttons': [
                        {
                            'title': 'This is a button',
                            'open_uri_action': {
                                'uri': 'https://assistant.google.com/'
                            }
                        }
                    ]
                }
            }]
        };
        sendResponse(result);
    });
};