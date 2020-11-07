var socket = io();
let id = null
socket.on('id', (data) => { id = data })

class UI {
    init() {
        this.startListener()
        this.handleFound()
        this.handleDisconnectPlayer()
        this.inGame()
        this.handleResult()
    }
    startListener() {
        const startButton = document.querySelector('.start-button')
        startButton.addEventListener('click', () => {
            socket.emit('findPlayer')
            document.querySelector('.container').innerHTML = 'Finding player...'
        })
    }
    handleFound() {
        socket.on('playerFound', () => {
            document.querySelector('.container').innerHTML = 'Player found!'
            setTimeout(() => {
                document.querySelector('.container').innerHTML = 'Starting game...'
                socket.emit('startGame')
            }, 1000)
        })
    }
    inGame() {
        socket.on('inGame', (data) => {
            if (data != 'deal') {
                document.querySelector('.container').innerHTML = data
            } else {
                let deal = 'rock'
                socket.emit('dealt', deal)
            }
        })
    }
    handleResult() {
        socket.on('result', (session) => {
            if (session.p1Id == id) {
                console.log('you dealt', session.p1dealt);
                console.log('opponent dealt', session.p2dealt);
            } else {
                console.log('you dealt', session.p2dealt);
                console.log('opponent dealt', session.p1dealt);
            }
            console.log(id);
            console.log(session);
        })
    }
    handleDisconnectPlayer() {
        socket.on('playerDisconnect', () => {
            document.querySelector('.container').innerHTML = 'Player disconnected!'
        })
    }
}
document.addEventListener('DOMContentLoaded', () => {
    ui = new UI
    ui.init()
})
