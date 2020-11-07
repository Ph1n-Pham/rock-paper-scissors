var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

//create route
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

waitingList = []

gameSessions = []

//when a client connect, do
io.on('connection', function (socket) {

    socket.on('findPlayer', async () => {
        console.log(waitingList);
        if (waitingList.length != 0 && waitingList[waitingList.length - 1] != socket.id){
            let p1Id = socket.id
            let p2Id = waitingList.pop()
            gameSessions.push({
                p1Id: p1Id,
                p2Id: p2Id,
                p1Score: 0,
                p2Score: 0
            })
            console.log(gameSessions);
            io.to(p1Id).to(p2Id).emit('playerFound')
        }else{
            waitingList.push(socket.id)
        }
    });


    socket.on('disconnect', function () {
        console.log(socket.id, 'disconnected.');
        let id = socket.id
        for (let i = 0; i < gameSessions.length; i++){
            console.log(gameSessions);
            let gameSession = gameSessions[i]
            if (gameSession.p1Id == id || gameSession.p2Id == id){
                io.to(gameSession.p1Id).to(gameSession.p2Id).emit('playerDisconnect')
                gameSessions.splice(i, 1)
            }
        }
    });
})

http.listen(80);

