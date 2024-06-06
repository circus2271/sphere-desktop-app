/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './styles/index.scss';

console.log('👋 This message is being logged by "renderer.js", included via Vite');



const sendButton = document.getElementById('send')
sendButton.onclick = () => {
    window.electronAPI.sendAPlaylist()
    sendButton.disabled = true
}

window.electronAPI.playlistIsReadyToBeUploaded(() => {
    // alert(178)
    sendButton.disabled = false
})



const setButton = document.getElementById('btn')
// const titleInput = document.getElementById('title')
setButton.addEventListener('click', () => {
    // const title = titleInput.value
    console.log('time update requested')
    // window.electronAPI.setTitle('fhsd22')
    window.electronAPI.requestTimeUpdate()
})




// window.electronAPI.startPlaylistUploading(() => {
//     alert(17)
//     setButton.disabled = true
// })

window.electronAPI.onTimeUpdate((value) => {
    console.log(value)
})

// drag and drop

const container = document.querySelector('.container')

container.addEventListener('dragenter', (e) => {
    container.classList.add('active')
})

container.addEventListener('dragleave', (e) => {
    if (e.target === container)
        container.classList.remove('active')
})

// container.addEventListener('click', (e) => {
//   container.classList.toggle('active')
// })


container.addEventListener('dragover', e => {
    // without this an image will be opened in a new tab
    e.preventDefault()
})

container.addEventListener('drop', e => {
    // without this an image will be opened in a new tab
    e.preventDefault()

    console.log('sfd')
    const files = e.dataTransfer.files
    // const filenames =[]
    // const filePaths = []
    const fileData = []
    // console.log(files[0])
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(file.name)
        const notAnMp3 = !file.name.endsWith('.mp3');
        if (notAnMp3) {
            console.warn(`file: '${file.name}' isn't an mp3`)
            continue
        }
        console.log(file.path)
        const fileDataObject = {
            filename: file.name,
            filepath: file.path
        }

        fileData.push(fileDataObject)

        // filenames.push(file.name)
        // filePaths.push(file.path)

    }

    window.electronAPI.sendFilePaths(fileData)
// window.electronAPI.sendFilePaths(filePaths)

    container.classList.remove('active')
})

// container.addEventListener('dragover', (e) => {
//   e.preventDefault()
//   e.stopPropagation();
//   e.preventDefault();
//   container.classList.add('active')
//  // console.log('dragover') container.classList.remove('active')
// })



window.electronAPI.onMetaDataRecieve((data) => {
    console.log('metadata', data)
    // const images = data.map(dataItem => {
    data.forEach(dataItem => {
        // const hasCover = !!dataItem.value.image
        // if dataItem.value.image exists
        const hasCover = dataItem.value.hasOwnProperty('image')
        if (!hasCover) {
            // alert('no cover')
            const placeholder = document.createElement('div')

            placeholder.classList.add('placeholder')
            // placeholder.style.height = '200px'
            // placeholder.style.width = '200px'
            // placeholder.classList.add('without-cover')
            document.body.prepend(placeholder)

            return
        }

        const buffer = dataItem.value.image.imageBuffer;
        const blob = new Blob([buffer]);
        const objectURL = URL.createObjectURL(blob)

        const image = new Image();
        image.style.height = '200px'
        image.style.width = '200px'
        image.onload = () => image.classList.add('loaded')
        image.src = objectURL
        0
        document.body.prepend(image)
    })
})

// alert(32443)

