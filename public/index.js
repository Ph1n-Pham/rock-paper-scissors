var socket = io();

class UI {
    init() {
        this.startListener()
        this.handleFound()
        this.handleDisconnectPlayer()
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
