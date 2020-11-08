require('dotenv').config()
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
    let id = socket.id
    socket.emit('id', id)
    socket.on('findPlayer', () => {
        removeSessionById(id)
        findPlayerHandler(id)
    });
    socket.on('startGame', () => {
        startGameHandler(id)
    })
    socket.on('dealt', (data) => {
        session = handleDealt(id, data)
        if (session) {
            io.to(session.p1Id).to(session.p2Id).emit('result', session)
        }
    })
    socket.on('disconnect', () => {
        console.log(id, 'disconnected.');
        removeSessionById(id)
        removeWaitlistById(id)
    });
})

function removeSessionById(id) {
    for (let i = 0; i < gameSessions.length; i++) {
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
            p2dealt: null,
            rounds: 1
        })
        io.to(p1Id).to(p2Id).emit('playerFound')
    } else if (waitingList.length == 0) {
        waitingList.push(id)
    }
}

function startGameHandler(id) {
    for (let i = 0; i < gameSessions.length; i++) {
        if (gameSessions[i].p1Id == id) {
            gameSessions[i].p1ready = true
        } else if (gameSessions[i].p2Id == id) {
            gameSessions[i].p2ready = true
        }
        if (gameSessions[i].p1ready == true && gameSessions[i].p2ready == true) {
            gameSessions[i].p1ready = false
            gameSessions[i].p2ready = false
            startGame(gameSessions[i].p1Id, gameSessions[i].p2Id)
            console.log('rounds: ', gameSessions[i].rounds);
        }
    }
}

async function startGame(id1, id2) {
    // console.log('game started for', id1, 'and', id2);
    io.to(id1).to(id2).emit('inGame', '3')
    await new Promise(resolve => setTimeout(resolve, 1000));
    io.to(id1).to(id2).emit('inGame', '2')
    await new Promise(resolve => setTimeout(resolve, 1000));
    io.to(id1).to(id2).emit('inGame', '1')
    await new Promise(resolve => setTimeout(resolve, 1000));
    io.to(id1).to(id2).emit('inGame', 'deal')
}

function handleDealt(id, data) {
    for (let i = 0; i < gameSessions.length; i++) {
        if (gameSessions[i].p1Id == id) {
            gameSessions[i].p1dealt = data
            gameSessions[i].p1dealtYet = true
        } else if (gameSessions[i].p2Id == id) {
            gameSessions[i].p2dealt = data
            gameSessions[i].p2dealtYet = true
        }

        if (gameSessions[i].p1dealtYet == true && gameSessions[i].p2dealtYet == true) {
            gameSessions[i].p1dealtYet = false
            gameSessions[i].p2dealtYet = false
            if (gameSessions[i].p1dealt == 'Rock') {
                if (gameSessions[i].p2dealt == 'Paper') {
                    gameSessions[i].p2Score = gameSessions[i].p2Score + 1
                } else if (gameSessions[i].p2dealt == 'Scissor') {
                    gameSessions[i].p1Score = gameSessions[i].p1Score + 1
                }
            } else if (gameSessions[i].p1dealtt == 'Paper') {
                if (gameSessions[i].p2dealt == 'Rock') {
                    gameSessions[i].p1Score = gameSessions[i].p1Score + 1
                } else if (gameSessions[i].p2dealt == 'Scissor') {
                    gameSessions[i].p2Score = gameSessions[i].p2Score + 1
                }
            } else if (gameSessions[i].p1dealt == 'Scissor') {
                if (gameSessions[i].p2dealt == 'Rock') {
                    gameSessions[i].p2Score = gameSessions[i].p2Score + 1
                } else if (gameSessions[i].p2dealt = 'Paper') {
                    gameSessions[i].p1Score = gameSessions[i].p1Score + 1
                }
            }
            // console.log(gameSessions[i].p1Score, gameSessions[i].p2Score);
            // console.log(gameSessions[i].p1dealt, gameSessions[i].p2dealt);
            gameSessions[i].rounds = gameSessions[i].rounds + 1
            return gameSessions[i]
        }
        return null
    }
}
http.listen(process.env.PORT || 3000);

