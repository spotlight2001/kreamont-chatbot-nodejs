"use strict";

const csv = require('csvtojson');
const fs = require('fs');
const Fuse = require('fuse.js');
const _ = require('lodash');
const http = require('https');

let fuse = undefined;

function getEnv(key) {
    let value = process.env[key];
    if (!value) {
        throw new Error('env ' + key + ' not set');
    }
    return value;
}

function getTelefonlisteCsv(onCsv) {
    const username = getEnv('KREAMONT_USER');
    const password = getEnv('KREAMONT_PASSWORD');
    console.log(`username: '${username}', password: '${password}'`);
    const url = `https://${username}:${password}@www.kreamont.at/telefonliste/telefonliste.csv`;

    http.get(url, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            let csvStr = body;
            let rows = csvStr.split('\n');
            rows.shift();
            rows.shift();
            rows.unshift('kind.nachname;kind.vorname;schulstufe;lehrer;festnetz;mutter.vorname;mutter.nachname;mutter.mobil;vater.vorname;vater.nachname;vater.mobil;mutter.email;vater.email;strasse;hausnummer;plz;ort;gps')
            console.log('csv rows: ' + rows.length);
            csvStr = rows.join('\n');            
            onCsv(csvStr);
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    })
}

function init() {
    getTelefonlisteCsv(function(csvStr) {
        let rows = [];
        csv({ delimiter: ';' }).fromString(csvStr).on('json', (row) => {
            console.log(JSON.stringify(row));
            rows.push({ person: row.mutter, index: `${row.mutter.vorname} ${row.mutter.nachname}` });
            rows.push({ person: row.vater, index: `${row.vater.vorname} ${row.vater.nachname}` });
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
                fuse = new Fuse(rows, options);
                console.log('done indexing');
            });
    });
};
init();

exports.fulfill = function (params, sendResponse) {
    console.log('searching now params: ' + JSON.stringify(params));
    let searchResults = fuse.search(_.trim(`${params.firstname} ${params.lastname}`));
    console.log('found matches: ' + JSON.stringify(searchResults));
    console.log('found matches: ' + searchResults.length);

    let result = `Ich hab ${searchResults.length} Person(en) für Dich gefunden\n`;
    searchResults.forEach(function (searchResult) {
        let person = searchResult.person;
        result += `${person.vorname} ${person.nachname} ${person.mobil} ${person.email}\n`;
    });
    sendResponse(result);
};