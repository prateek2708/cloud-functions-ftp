'use strict';
const PROJECT_ID = "seismic-box-219016";
const { Storage } = require('@google-cloud/storage');
// Creates a client
const storage = new Storage({
    projectId: PROJECT_ID,
    keyFilename: 'serviceAccountKey.json'
});
const csv = require('csvtojson');
const firebase = require('firebase');
firebase.initializeApp({
    "appName": "test app",
    "serviceAccount": '../serviceAccountKey.json',
    "databaseURL": 'https://seismic-box-219016.firebaseio.com/',
});
const functions = require('firebase-functions');
exports.createOrders = functions.storage.bucket('ftp_demo').object().onFinalize(event => {
    console.log("inside method...")
    storage
        .bucket(event.bucket)
        .file(event.name)
        .download().then(contents => {
            console.log("data: " + contents.toString('utf-8'));
            return contents.toString('utf-8');
        })
        .then(data => csv().fromString(data))
        .then((csvRow) => {
            console.log("csvRow:" + csvRow)
            return csvRow;
        })
        .then((jsonData) => {
            var ref = firebase.database().ref('/orders/');
            ref.push(jsonData);
            return;
        })
        .catch(e => console.log(e));
    return 0;
});
