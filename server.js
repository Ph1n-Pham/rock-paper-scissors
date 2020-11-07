var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

//create route
app.use(express.static('public'))
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

waitingList = []

gameSessions = []


//when a client connect, do
io.on('connection', function (socket) {
    let id = socket.id
    socket.emit('id', id)
    socket.on('findPlayer', () => {
        removeSessionById(id)
        findPlayerHandler(id)
    });
    socket.on('startGame', () => {
        startGameHandler(id)
        socket.on('dealt', (data) => {
            session = handleDealt(id, data)
            if (session){
                io.to(session.p1Id).to(session.p2Id).emit('result', session)
            }
        })
    })

    socket.on('disconnect', () => {
        console.log(id, 'disconnected.');
        removeSessionById(id)
        removeWaitlistById(id)
    });
})

function removeSessionById(id) {
    for (let i = 0; i < gameSessions.length; i++) {
        console.log(gameSessions);
        let gameSession = gameSessions[i]
        if (gameSession.p1Id == id) {
            io.to(gameSession.p2Id).emit('playerDisconnect')
            gameSessions.splice(i, 1)
        } else if (gameSession.p2Id == id) {
            io.to(gameSession.p1Id).emit('playerDisconnect')
            gameSessions.splice(i, 1)
        }
    }
}

function removeWaitlistById(id) {
    for (let i = 0; i < waitingList.length; i++) {
        if (id == waitingList[i]) {
            waitingList.splice(i, 1)
        }
    }
}

function findPlayerHandler(id) {
    if (waitingList.length != 0 && waitingList[waitingList.length - 1] != id) {
        let p1Id = id
        let p2Id = waitingList.pop()
        gameSessions.push({
            p1Id: p1Id,
            p2Id: p2Id,
            p1Score: 0,
            p2Score: 0,
            p1ready: false,
            p2ready: false,
            p1dealtYet: false,
            p2dealtYet: false,
            p1dealt: null,
            p2dealt: null
        })
        io.to(p1Id).to(p2Id).emit('playerFound')
    } else if (waitingList.length == 0) {
        waitingList.push(id)
    }
}

function startGameHandler(id) {
    for (let i = 0; i < gameSessions.length; i++) {
        gameSession = gameSessions[i]
        if (gameSession.p1Id == id) {
            gameSession.p1ready = true
        } else if (gameSession.p2Id == id) {
            gameSession.p2ready = true
        }
        if (gameSession.p1ready == true && gameSession.p2ready == true) {
            startGame(gameSession.p1Id, gameSession.p2Id)
        }
    }

}

function startGame(id1, id2) {
    console.log('game started for', id1, 'and', id2);
    setTimeout(() => {
        io.to(id1).to(id2).emit('inGame', '3')
    }, 1000)
    setTimeout(() => {
        io.to(id1).to(id2).emit('inGame', '2')
    }, 2000)
    setTimeout(() => {
        io.to(id1).to(id2).emit('inGame', '1')
    }, 3000)
    setTimeout(() => {
        io.to(id1).to(id2).emit('inGame', 'deal')
    }, 4000)
}

function handleDealt(id, data) {
    for (let i = 0; i < gameSessions.length; i++) {
        gameSession = gameSessions[i]
        p1dealt = gameSession.p1dealt
        p2dealt = gameSession.p2dealt
        
        if (gameSession.p1Id == id) {
            gameSession.p1dealt = data
            gameSession.p1dealtYet = true
        } else if (gameSession.p2Id == id) {
            gameSession.p2dealt = data
            gameSession.p2dealtYet = true
        }
        if (gameSession.p1dealtYet == true && gameSession.p2dealtYet == true) {
            if (p1dealt == 'rock') {
                if (p2dealt == 'paper') {
                    gameSession.p2Score = gameSession.p2Score + 1
                } else if (p2dealt == 'scissors') {
                    gameSession.p1Score = gameSession.p1Score + 1
                }
            } else if (p1dealt == 'paper') {
                if (p2dealt == 'rock') {
                    gameSession.p1Score = gameSession.p1Score + 1
                } else if (p2dealt == 'scissors') {
                    gameSession.p2Score = gameSession.p2Score + 1
                }
            } else if (p1dealt == 'scissors') {
                if (p2dealt == 'rock') {
                    gameSession.p2Score = gameSession.p2Score + 1
                } else if (p2dealt = 'paper') {
                    gameSession.p1Score = gameSession.p1Score + 1
                }
            }
            gameSession.p1dealtYet = false
            gameSession.p2dealtYet = false
            return gameSession
        }
        return null
    }
}
http.listen(80);

