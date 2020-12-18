const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

let movies = [];

// database setup
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'movies';
let db;
MongoClient.connect(dbUrl, (err, client) => {
     if(err != null) {
         console.log('Connected to the database');
     } else {
         console.log(err);
     }
     db = client.db(dbName);
    insertDocument(db, function() {
        findDocuments(db, function() {
            client.close();
        });
    });
});

function insertDocument(db, callback) {
    const collection = db.collection('movies');
    collection.insertOne({title: 'test'}, (err, result) => {
        callback(result);
    });
}

function findDocuments(db, callback) {
    const collection = db.collection('movies');
    collection.find({}).toArray((err, docs) => {
        movies = docs;
        callback(docs);
    })
}



const server = express();
const port = 3000;
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

// Logging middleware
server.use((req, res, next) => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const timeString = `${hours}:${minutes}:${seconds}`;
    const requestPath = req.path;
    const requestBody = req.body;
    const method = req.method;

    console.log(`${timeString} - ${method} ${requestPath}`);
    console.log(requestBody);

    next();
});

server.get('/api/movies/all', (req, res) => {
    res.json(movies);
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
