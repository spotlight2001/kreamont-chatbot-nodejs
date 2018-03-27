"use strict";

const http = require("https");
const moment = require('moment');

exports.fulfill = function(sendResponse) {

    let url = 'https://clients6.google.com/calendar/v3/calendars/32kbr4dsdljsqgpsromm2det5c@group.calendar.google.com/events?calendarId=32kbr4dsdljsqgpsromm2det5c@group.calendar.google.com&singleEvents=true&timeZone=Europe/Vienna&maxAttendees=1&maxResults=3&sanitizeHtml=true&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs&timeMin=';

    // 2018-02-26T00:00:00+01:00
    let dateParam = moment().startOf('day');
    dateParam = dateParam.format("YYYY-MM-DD[T]00:00:00+01:00");
    dateParam = encodeURIComponent(dateParam);
    url += dateParam;
    console.log('url: ' + url);

    http.get(url, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var response = JSON.parse(body);
            console.log("Got a response: ", response);
            let result = 'Die nächsten Termine: \n';
            for (let i = 0; i < response.items.length; i++) {
                let item = response.items[i];
                let date = item.start.date;
                let title = item.summary;
                result += date + ' ' + title + '\n';
            }
            sendResponse(result);
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
};