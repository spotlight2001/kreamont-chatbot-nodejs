"use strict";

const _ = require('lodash');
const Fuse = require('fuse.js');
const telefonlisteClient = require('./telefonliste.client');
const userService = require('./user.service');

let nameIndex = undefined;

function init() {
    telefonlisteClient.getPersons().then(function(persons) {
        nameIndex = new Fuse(persons, {
            shouldSort: true,
            threshold: 0.1,
            tokenize: true,
            matchAllTokens: true,
            keys: ['index']
        });
        console.log('done indexing');
    }).catch(function(error) {
        console.error(error);
    });
};
init();

exports.fulfill = function (params, sendResponse, request) {
    let user = userService.getUser(request);
    if (!user) {
        sendResponse('Leider hat mir Google nicht verraten wer Du bist. Bitte Konto verknüpfen!');
        return;
    } else if (! user.isKreamont) {
        sendResponse('Deine e-mail "' + user.email + '" hab ich nicht leider nicht auf der Telefonliste gefunden. Du darfst die Funktion nicht benutzen.');
        return;
    }

    console.log('searching now params: ' + JSON.stringify(params));
    let persons = nameIndex.search(_.trim(`${params.firstname} ${params.lastname}`));
    console.log('found matches: ' + JSON.stringify(persons));
    console.log('found matches: ' + persons.length);

    let result = `Ich hab ${persons.length} Person(en) für Dich gefunden\n`;
    persons.forEach(function (person) {
        result += `${person.vorname} ${person.nachname} ${person.mobil} ${person.email}\n`;
    });
    sendResponse(result);
};