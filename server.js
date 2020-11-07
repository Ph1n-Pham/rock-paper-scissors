var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

//create route
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

//when a client connect, do
io.on('connection', function (socket) {
    console.log(socket.id + " has connected to the server");
    socket.on('disconnect', function () {
        console.log(socket.id + " has disconnected from the server");
    });

    socket.on('clientmsg', function (msg) {
        console.log(socket.id + ' said ' + msg);
        io.sockets.emit('servermsg', msg);
    });
})

http.listen(80);

