"use strict";

const _ = require('lodash');
const Fuse = require('fuse.js');
const telefonlisteClient = require('./telefonliste.client');
const userService = require('./user.service');
const INTENT_GET_PERSON_DATA = 'intent_get_person_data';

let nameIndex = undefined;

function init() {
    telefonlisteClient.getPersons().then(function (persons) {
        nameIndex = new Fuse(persons, {
            shouldSort: true,
            threshold: 0.1,
            tokenize: true,
            matchAllTokens: true,
            keys: ['index']
        });
        console.log('done indexing');
    }).catch(function (error) {
        console.error(error);
    });
};
init();

exports.fulfill = function (request, dialogflowApp) {
    if (dialogflowApp.getSignInStatus() !== dialogflowApp.SignInStatus.OK) {
        dialogflowApp.setContext('intent_before_login', null, request.body.result);
        dialogflowApp.askForSignIn();
        return;
    }
    let user = userService.getUser(request);
    if (! user) {
        console.error('no user.');
        return;
    }
    if (!user.isKreamont) {
        dialogflowApp.tell(`Deine e-mail "${user.email}" hab ich nicht leider nicht auf der Telefonliste gefunden. Du darfst die Funktion nicht benutzen.`);
        return;
    }

    let params = request.body.result.parameters || {};
    console.log('searching now params: ' + JSON.stringify());
    let persons = nameIndex.search(_.trim(`${params.firstname} ${params.lastname}`));
    console.log('found matches: ' + persons.length);
    if (persons.length <= 0) {
        dialogflowApp.tell('Hab leider niemanden gefunden');
    }

    console.log('found matches: ' + JSON.stringify(persons));
    let richResponse = dialogflowApp.getIncomingRichResponse();
    persons.forEach(function (person) {
        richResponse.addSimpleResponse(`${person.vorname} ${person.nachname} ${person.mobil} ${person.email}`);
    });
    dialogflowApp.tell(richResponse.addSuggestionLink('Telefonliste', 'https://www.kreamont.at/telefonliste'));
};