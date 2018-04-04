"use strict";

const _ = require('lodash');
const http = require("request-promise-native");
const moment = require('moment');
const userService = require('./user.service');

function getUrl(calendarId) {
    // 2018-02-26T00:00:00+01:00
    let dateParam = moment().startOf('day');
    dateParam = dateParam.format("YYYY-MM-DD[T]00:00:00+01:00");
    dateParam = encodeURIComponent(dateParam);
    let url = 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events?key=AIzaSyAQt8f07E4UQINLoYjaqMpegyWs8BzgeUg&maxResults=3&orderBy=startTime&singleEvents=true&timeMin=' + dateParam;
    return url;
}

exports.fulfill = function (request, sendResponse) {
    let url = undefined;
    let user = userService.getUser(request);
    let publicCalendarPromise = http.get({ json: true, uri: getUrl('32kbr4dsdljsqgpsromm2det5c@group.calendar.google.com') });
    let privateCalendarPromise = http.get({ json: true, uri: getUrl('4gvh2mvg0lh96d1o0g0k19jon4@group.calendar.google.com') });
    let promises = [publicCalendarPromise];
    if (user && user.isKreamont) {
        promises.push(privateCalendarPromise);
    }

    Promise.all([publicCalendarPromise, privateCalendarPromise]).then(function (calendars) {
        let appointments = [];
        for (let calendar of calendars) {
            for (let appointment of calendar.items) {
                appointments.push(appointment);
            }
        }
        appointments = _.sortBy(appointments, ['start.date']);
        appointments = appointments.slice(0, 3);
        console.log('got appointments: ' + appointments.length);
        let result = 'Die nächsten Termine: \n';
        for (let appointment of appointments) {
            console.log(appointment.start.date);
            let date = appointment.start.date;
            let title = appointment.summary;
            result += date + ' ' + title + '\n';
        }
        sendResponse(result);
        for (let i = 0; i < response.items.length; i++) {

        }
    });
};