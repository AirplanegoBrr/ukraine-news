async function start() {
    const express = require('express');
    const serveIndex = require('serve-index')
    const app = express();
    const http = require('http');
    const server = http.createServer(app);
    const { Server } = require("socket.io");
    const io = new Server(server);
    const console = require('./console.js');

    //view ejs
    app.set('view engine', 'ejs');
    //public folder
    app.use(express.static('public'));

    app.use('/news', express.static('news'), serveIndex('news', {'icons': true}))
    app.use('/newsJSON', express.static('newsJSON'), serveIndex('newsJSON', {'icons': true}))

    io.on('connection', (socket) => {
        console.debug('a user connected');

        socket.on('fetch', () => {
            console.debug('fetching');
        })

        socket.on('disconnect', () => {
            console.debug('user disconnected');
        });
    });

    app.get('/', (req, res) => {
        res.render('index');
    });

    server.listen(8000, () => {
        console.log("Server started on port 8000");
    });
}


module.exports = {
    start
}