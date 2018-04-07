"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const newsService = require('./app/intent-news.service');
const calendarService = require('./app/intent-calendar.service');
const telefonlisteService = require('./app/intent-telefonliste.service');
const userService = require('./app/user.service');
const http = require("request-promise-native");
const { DialogflowApp } = require('actions-on-google');

const restService = express();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.get("/", function (request, response) {
  return response.json({ test: true });
});

restService.post("/api/dialogflow-webhook", function (request, response) {
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  const dialogflowApp = new DialogflowApp({ request: request, response: response });
  const actions = new Map();
  actions.set('GetNewsFromWordpress', () => newsService.fulfill(dialogflowApp));
  actions.set('get_termine', () => calendarService.fulfill(request, dialogflowApp));
  actions.set('GetPersonDataFromTelephoneList', () => telefonlisteService.fulfill(request, dialogflowApp));
  actions.set('sign_in_result', () => {
    if (dialogflowApp.getSignInStatus() === dialogflowApp.SignInStatus.OK) {
      let parametersFromIntentBeforeLogin = dialogflowApp.getContext('intent_before_login').parameters.parameters;
      request.body.result.parameters = Object.assign(request.body.result.parameters, parametersFromIntentBeforeLogin);
      telefonlisteService.fulfill(request, dialogflowApp);
      return;
    }
    dialogflowApp.tell('Ups ohne Anmeldung gehts hier leider nicht weiter');
  });
  dialogflowApp.handleRequest(actions);
});

restService.listen(process.env.PORT || 5000, function () {
  console.log("Server up and listening");
});

