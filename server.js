const { movies } = require('./movies.js')
const express = require('express');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require("path");


// database setup
const dbUrl = 'mongodb://mongo:27017';
const dbName = 'movies';
const moviesCollection = 'movies';

const server = express();
const port = 3000;
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

const upload = multer({dest: 'uploads/'})

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
// Cors middleware
server.use(cors({ origin: true, credentials: true }));

MongoClient.connect(dbUrl, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db(dbName);
        const byTitle = {title: 1}

        // Get all movies
        server.get('/api/movies/all', (req, res) => {
            db.collection(moviesCollection).find().sort(byTitle).toArray()
                .then(results => {
                    res.json(results);
                })
                .catch(error => console.log(error));
        });

        // Get movie from id
        server.get('/api/movies/:id', (req, res) => {
            db.collection(moviesCollection).findOne(
                {_id: ObjectId(req.params.id)},
            )
                .then(results => {
                    res.json(results)
                })
                .catch(error => console.log(error));
        })

        // Create a movie
        server.post('/api/movies', (req, res) => {
            db.collection(moviesCollection).insertOne(
                {
                    title: req.body.title,
                    year: req.body.year,
                    language: req.body.language,
                    director: {
                        name: req.body.director.name,
                        nationality: req.body.director.nationality,
                        birthDate: req.body.director.birthDate,
                    },
                    genre: req.body.genre,
                    rating: req.body.rating,
                    posterUrl: req.body.posterUrl,
                }
            )
                .then(results => {
                    res.json({message: "Inserted movie into database successfully"});
                })
                .catch(error => console.log(error));
        });

        // Update a movie
        server.put('/api/movies/:id', (req, res) => {
            db.collection(moviesCollection).findOneAndUpdate(
                {_id : ObjectId(req.params.id)},
                {
                    $set: {
                        title: req.body.title,
                        year: req.body.year,
                        language: req.body.language,
                        director: {
                            name: req.body.director.name,
                            nationality: req.body.director.nationality,
                            birthDate: req.body.director.birthDate,
                        },
                        genre: req.body.genre,
                        rating: req.body.rating,
                        posterUrl: req.body.posterUrl,
                    }
                },
            )
                .then(results => {
                    res.json({message: "Updated movie successfully"});
                })
                .catch(error => console.log(error));
        });

        // Rate a movie
        server.put('/api/movies/:id/rate', (req, res) => {
            console.log(req.body.rating);
           db.collection(moviesCollection).findOneAndUpdate(
               {_id : ObjectId(req.params.id)},
               {
                   $set: {
                       rating: req.body.rating,
                   }
               }
           )
               .then(results => {
                   res.json({message: "Rated movie successfully"});
               })
               .catch(error => console.log(error));
        });

        // Delete a movie
        server.delete('/api/movies/:id', (req, res) => {
           db.collection(moviesCollection).findOneAndDelete(
               {_id : ObjectId(req.params.id)},
           )
               .then(results => {
                   res.json({message: "Deleted movie successfully"});
               })
               .catch(error => console.log(error));
        });

        // Upload a poster
        server.post('/upload', upload.single('poster'), function (req, res, next) {
            // req.file is the `avatar` file
            // req.body will hold the text fields, if there were any
            res.json({posterUrl: req.file.path});
        })

        // Get an image
        server.get('/uploads/:filename', (req, res) => {
            var options = {
                root: path.join(__dirname)
            };
            res.sendFile('/uploads/' + req.params.filename, options);
        })
    })
    .catch(error => console.error(error))


server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
