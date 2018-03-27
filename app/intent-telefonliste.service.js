"use strict";

const request = require('request');
const csv = require('csvtojson');
const fs = require('fs');
const Fuse = require('fuse.js');

const username = process.env.KREAMONT_USER;
const password = process.env.KREAMONT_PASSWORD;

exports.fulfill = function (sendResponse) {
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
    let csvStr = fs.readFileSync("./app/telefonliste.csv")
    const rows = [];
    csv({ delimiter: ';' }).fromString(csvStr).on('json', (row) => {
        console.log(JSON.stringify(row));
        rows.push(row);
    })
        .on('done', (error) => {
            console.log('end');

            var options = {
            };
            var fuse = new Fuse(rows, options);
            console.log('searching now');
            let searchResult = fuse.search('Walter');

            console.log('search result: ' + JSON.stringify(searchResult));

            sendResponse('bla bla');
        });
};