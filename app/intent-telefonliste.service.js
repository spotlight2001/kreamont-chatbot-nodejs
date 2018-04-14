"use strict";

const _ = require('lodash');
const Fuse = require('fuse.js');
const telefonlisteClient = require('./telefonliste.client');
const userService = require('./user.service');
const INTENT_GET_PERSON_DATA = 'intent_get_person_data';
const { Responses } = require('actions-on-google');


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

function getName(person) {
    var result = '';
    if (person.vorname) {
        result += person.vorname;
    }
    if (person.nachname) {
        result += ' ' + person.nachname;
    }
    return result;
};

function concatenate() {
    console.log(JSON.stringify(arguments));
    let result = '';
    for (let argument of arguments) {
        if (!argument) {
            continue;
        }
        result += ' ' + argument;
    }
    result = result.trim();
    return result;
}

function getPhonenumber(person) {
    console.log('getPhonenumber arguments: ' + JSON.stringify(arguments));
    let phonenumber = person.mobil;
    if (!phonenumber) {
        return null;
    }
    phonenumber = phonenumber.replace(/[ /-]/, '');
    return phonenumber;
};

exports.fulfill = function (request, dialogflowApp) {
    let user = userService.getUser(request);
    if (!user) {
        dialogflowApp.setContext('intent_before_login', null, request.body.result);
        dialogflowApp.askForSignIn();
        return;
    }
    if (!user.isKreamont) {
        dialogflowApp.tell(`Deine e-mail "${user.email}" hab ich nicht leider nicht auf der Telefonliste gefunden. Du darfst die Funktion nicht benutzen.`);
        return;
    }

    let params = request.body.result.parameters || {};
    console.log('searching now params: ' + JSON.stringify(params));
    let persons = nameIndex.search(_.trim(`${params.firstname} ${params.lastname}`));
    console.log('found matches: ' + persons.length);
    if (persons.length <= 0) {
        dialogflowApp.tell('Hab leider niemanden gefunden');
        return;
    }

    console.log('found matches: ' + JSON.stringify(persons));
    let richResponse = dialogflowApp.getIncomingRichResponse();
    richResponse.addSimpleResponse(`Schau an wen ich gefunden hab:`);
    let browseCarousel = dialogflowApp.buildBrowseCarousel();
    persons.forEach(function (person) {
        const title = getName(person) + ' anrufen';
        const url = 'https://www.kreamont.at/telefonliste/anrufen.html?tel=' + getPhonenumber(person);
        const imageUrl = 'http://www.kreamont.at/telefonliste/avatars/thumbs/' + encodeURIComponent(`${person.nachname} ${person.vorname}.jpg`);
        browseCarousel.addItems([dialogflowApp.buildBrowseItem(title, url)
            .setImage(imageUrl, getName(person))]);
    });
    let telefonlisteUrl = 'https://www.kreamont.at/telefonliste/?q=' + concatenate(params.firstname, params.lastname);
    browseCarousel.addItems([dialogflowApp.buildBrowseItem('Telefonliste öffnen', telefonlisteUrl)
        .setImage('https://www.uni-wuerzburg.de/fileadmin/news_import/kreamont_logo.jpg', 'Logo von Kreamont')]);
    richResponse.addBrowseCarousel(browseCarousel);
    dialogflowApp.tell(richResponse);
};