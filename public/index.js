var socket = io();
let id = null
socket.on('id', (data) => { id = data })

const infoButton = document.querySelector('.info-button')
const overlay = document.querySelector('.overlay')
const startButton = document.querySelector('.start-button')


class UI {
    init() {
        this.infoListener()
        this.startListener()
        this.handleFound()
        this.handleDisconnectPlayer()
        this.inGame()
        this.handleResult()
        this.loadModel()
    }
    infoListener() {
        infoButton.addEventListener('mouseover', () => {
            overlay.style.color = 'black'
            overlay.classList.add('overlay-info')
            overlay.innerHTML = `
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
            overlay.style.color = 'white'
            overlay.classList.remove('overlay-info')
            overlay.innerHTML = ``
        })
    }
    startListener() {
        startButton.addEventListener('click', () => {
            socket.emit('findPlayer')
            overlay.style.color = 'white'
            overlay.innerHTML = '<h1 class="h1-status">Finding player...</h1>'
        })
    }
    handleFound() {
        socket.on('playerFound', () => {
            overlay.style.color = 'white'
            overlay.innerHTML = '<h1 class="h1-status">Player found!</h1>'
            setTimeout(() => {
                overlay.innerHTML = '<h1 class="h1-status">Starting game...</h1>'
                socket.emit('startGame')
            }, 500)
        })
    }
    inGame() {
        socket.on('inGame', (data) => {
            const labelContainer = document.querySelector('#label-container')
            if (data != 'deal') {
                overlay.innerHTML = `<h1 class="h1-status">${data}</h1>`
            } else {
                socket.emit('dealt', labelContainer.innerText)
            }
        })
    }
    handleResult() {
        socket.on('result', async (session) => {
            if (session.p1Id == id) {
                //you are player 1
                overlay.innerHTML = `<p class="p-status">${session.p1dealt} - ${session.p2dealt}</p>`
                await new Promise(resolve => setTimeout(resolve, 2000));
                overlay.innerHTML = `<h1 class="h1-status">${session.p1Score} - ${session.p2Score}</h1>`
            } else {
                //you are player 2
                overlay.innerHTML = `<p class="p-status">${session.p2dealt} - ${session.p1dealt}</p>`
                await new Promise(resolve => setTimeout(resolve, 2000));
                overlay.innerHTML = `<h1 class="h1-status">${session.p2Score} - ${session.p1Score}</h1>`
            }
            //sleep for 1s
            await new Promise(resolve => setTimeout(resolve, 1000));
            socket.emit('startGame')
        })
    }
    handleDisconnectPlayer() {
        socket.on('playerDisconnect', () => {
            overlay.innerHTML = '<h1 class="h1-status">Player disconnected!</h1>'
            setTimeout(()=>{
                overlay.innerHTML = ''
            }, 1000)
        })
    }
    loadModel() {
        const URL = "https://teachablemachine.withgoogle.com/models/r00D_RGrB/";
        let model, webcam, labelContainer, maxPredictions;
        // Load the image model and setup the webcam
        async function initiateModel() {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            // load the model and metadata
            // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
            // or files from your local hard drive
            // Note: the pose library adds "tmImage" object to your window (window.tmImage)
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            // Convenience function to setup a webcam
            const flip = true; // whether to flip the webcam
            webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
            await webcam.setup(); // request access to the webcam
            await webcam.play();
            window.requestAnimationFrame(loop);

            const container = document.querySelector('.container')
            container.innerHTML = `
                <div id="label-container"></div>
                <div id="webcam-container"></div>
            `
            startButton.disabled = false

            // append elements to the DOM
            document.getElementById("webcam-container").appendChild(webcam.canvas);
            labelContainer = document.getElementById("label-container");
            for (let i = 0; i < maxPredictions; i++) { // and class labels
                labelContainer.appendChild(document.createElement("div"));
            }
        }

        async function loop() {
            webcam.update(); // update the webcam frame
            await predict();
            window.requestAnimationFrame(loop);
        }

        // run the webcam image through the image model
        async function predict() {
            // predict can take in an image, video or canvas html element
            const predictions = await model.predictTopK(webcam.canvas, 1);
            labelContainer.innerText = predictions[0].className;
        }
        initiateModel()
    }
}
document.addEventListener('DOMContentLoaded', () => {
    ui = new UI
    ui.init()
})
