
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




// window.electronAPI.startPlaylistUploading(() => {
//     alert(17)
//     setButton.disabled = true
// })






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

    sendButton.disabled = true

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

    container.classList.remove('active')
})


// alert(32443)

