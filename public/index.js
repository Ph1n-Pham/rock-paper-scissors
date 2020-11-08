var socket = io();
let id = null
socket.on('id', (data) => { id = data })

class UI {
    init() {
        this.infoListener()
        this.startListener()
        this.handleFound()
        this.handleDisconnectPlayer()
        this.inGame()
        this.handleResult()
    }
    infoListener() {
        const infoButton = document.querySelector('.info-button')
        const container = document.querySelector('.container')
        infoButton.addEventListener('mouseover', () => { 
            container.classList.add('container-info')
            container.innerHTML = `
                <h1>Welcome to the live rock paper scissors game</h1>
                    <ol>
                        <li>Enable camera to take part in the game!</li>
                        <li>Press start to find an opponent to rock against!</li>
                        <li>Just like a real rock paper scissors game, use your hand to play.</li>
                    </ol>
                    <div class="illustration">
                        <i class="fas fa-hand-rock"></i>
                        <i class="fas fa-hand-paper"></i>
                        <i class="fas fa-hand-scissors"></i>
                    </div>
            `
        })
        infoButton.addEventListener('mouseout', () => { 
            container.classList.remove('container-info')
            container.innerHTML = ''
        })
    }
    startListener() {
        const startButton = document.querySelector('.start-button')
        startButton.addEventListener('click', () => {
            socket.emit('findPlayer')
            document.querySelector('.container').innerHTML = '<h1>Finding player...</h1>'
        })
    }
    handleFound() {
        socket.on('playerFound', () => {
            document.querySelector('.container').innerHTML = '<h1>Player found!</h1>'
            setTimeout(() => {
                document.querySelector('.container').innerHTML = '<h1>Starting game...</h1>'
                socket.emit('startGame')
            }, 500)
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
