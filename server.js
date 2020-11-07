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
        let id = socket.id
        removeSessionById(id)

        if (waitingList.length != 0 && waitingList[waitingList.length - 1] != socket.id) {
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
        } else if (waitingList.length == 0) {
            waitingList.push(socket.id)
        }
    });


    socket.on('disconnect', function () {
        console.log(socket.id, 'disconnected.');
        let id = socket.id
        removeSessionById(id)
        removeWaitlistById(id)
    });
})

function removeSessionById(id){
    for (let i = 0; i < gameSessions.length; i++) {
        console.log(gameSessions);
        let gameSession = gameSessions[i]
        if (gameSession.p1Id == id) {
            io.to(gameSession.p2Id).emit('playerDisconnect')
            gameSessions.splice(i, 1)
        }else if(gameSession.p2Id == id){
            io.to(gameSession.p1Id).emit('playerDisconnect')
            gameSessions.splice(i, 1)
        }
    }
}

function removeWaitlistById(id){
    for (let i = 0; i < waitingList.length; i++) {
        if (id == waitingList[i]) {
            waitingList.splice(i, 1)
        }
    }
}
http.listen(80);

