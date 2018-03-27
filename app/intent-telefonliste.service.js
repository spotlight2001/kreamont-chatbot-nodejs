"use strict";

const request = require('request');
const csv = require('csvtojson');
const fs = require('fs');
const Fuse = require('fuse.js');
const _ = require('lodash');

const username = process.env.KREAMONT_USER;
const password = process.env.KREAMONT_PASSWORD;

exports.fulfill = function (params, sendResponse) {
    /*
    const url = 'https://' + username + ':' + password + '@www.kreamont.at/telefonliste/telefonliste.csv';
    csv()
        .fromStream(request.get(url))
        .on('json', (json) => {
            console.log(JSON.stringify(json));
        })
        .on('done', (error) => {
            console.log('end');
            sendResponse('bla bla');
        });
        */
    let csvStr = fs.readFileSync("./data/telefonliste.csv")
    let rows = [];
    csv({ delimiter: ';' }).fromString(csvStr).on('json', (row) => {
        console.log(JSON.stringify(row));
        rows.push({person: row.mutter, index: `${row.mutter.vorname} ${row.mutter.nachname}`});
        rows.push({person: row.vater, index: `${row.vater.vorname} ${row.vater.nachname}`});
    })
        .on('done', (error) => {
            console.log('rows before making unique: ' + rows.length);
            rows = _.uniqBy(rows, 'index');
            console.log('rows after making unique: ' + rows.length);

            var options = {
                shouldSort: true,
                threshold: 0.3,
                tokenize: true,
                matchAllTokens: true,
                keys: ['index']
            };
            var fuse = new Fuse(rows, options);
            console.log('searching now params: ' + JSON.stringify(params));
            let searchResults = fuse.search(_.trim(`${params.firstname} ${params.lastname}`));
            console.log('found matches: ' + JSON.stringify(searchResults));
            console.log('found matches: ' + searchResults.length);

                let result = `Ich hab ${searchResults.length} Person(en) für Dich gefunden\n`;
                searchResults.forEach(function(searchResult) {
                    let person = searchResult.person;
                    result += `${person.vorname} ${person.nachname} ${person.mobil} ${person.email}\n`;
                });
                sendResponse(result);
    });
};