"use strict";

const http = require("http");

exports.fulfill = function(sendResponse) {

    const url = 'http://www.kreamont.at/wp-json/wp/v2/posts?per_page=1';    
    http.get(url, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            body += chunk;
        });
    
        res.on('end', function(){
            var response = JSON.parse(body);
            console.log("Got a response: ", response);
            sendResponse(response[0].title.rendered); // WARN: no news = empty array breaks this code
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
};