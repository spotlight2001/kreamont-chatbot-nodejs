"use strict";

const http = require("request-promise-native");

exports.fulfill = function (dialogflowApp) {
    const url = 'http://www.kreamont.at/wp-json/wp/v2/posts?per_page=1';
    http.get({ json: true, uri: url }).then(function (news) {

        if (news.length <= 0) {
            dialogflowApp.tell('Leider hab ich keine Neuigkeiten gefunden');
            return;
        }
        let info = news[0];
        let title = info.title.rendered;
        let url = info.link;
        dialogflowApp.tell(dialogflowApp.getIncomingRichResponse().addSimpleResponse(title).addSuggestionLink('Artikel', url));
    });
};