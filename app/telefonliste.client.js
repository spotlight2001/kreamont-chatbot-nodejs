"use strict";

const csv = require('csvtojson');
const _ = require('lodash');
const http = require('request-promise-native');

let persons = undefined;

function getEnv(key) {
    let value = process.env[key];
    if (!value) {
        throw new Error('env ' + key + ' not set');
    }
    return value;
}

function getTelefonlisteCsv() {
    const username = 'eltern';
    const password = getEnv('KREAMONT_PASSWORD');
    console.log(`username: '${username}', password: '${password}'`);
    const url = `https://${username}:${password}@www.kreamont.at/telefonliste/telefonliste.csv`;    
    return http.get(url);
}

function replaceCsvHeader(csvStr) {
    return new Promise(function(resolve, reject) {
        let rows = csvStr.split('\n');
        rows.shift();
        rows.shift();
        rows.unshift('kind.nachname;kind.vorname;schulstufe;lehrer;festnetz;mutter.vorname;mutter.nachname;mutter.mobil;vater.vorname;vater.nachname;vater.mobil;mutter.email;vater.email;strasse;hausnummer;plz;ort;gps')
        console.log('csv rows: ' + rows.length);
        csvStr = rows.join('\n');
        resolve(csvStr);
    });
}

function csvToJson(csvStr) {
    return new Promise(function (resolve, reject) {
        if (persons) {
            resolve(persons);
            return;
        }

        // lazy load
        let rows = [];
        csv({ delimiter: ';' }).fromString(csvStr).on('json', (row) => {
            console.log(JSON.stringify(row));
            rows.push(Object.assign(row.mutter, { index: `${row.mutter.vorname} ${row.mutter.nachname}` }));
            rows.push(Object.assign(row.vater, { index: `${row.vater.vorname} ${row.vater.nachname}` }));
        })
            .on('done', (error) => {
                console.log('rows before making unique: ' + rows.length);
                rows = _.uniqBy(rows, 'index');
                console.log('rows after making unique: ' + rows.length);
                resolve(rows);
            });
    });
};

exports.getPersons = function () {
    return getTelefonlisteCsv().then(replaceCsvHeader).then(csvToJson);
};