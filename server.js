const { movies } = require('./movies.js')

const express = require('express');
const bodyParser = require('body-parser');

const server = express();
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

server.listen(3000, () => {
    console.log('Listening on port 3000');
});