
import './styles/index.scss';
// import {ipcRenderer} from "electron";

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


//
// window.electronAPI.onMetaDataRecieve((data) => {
//     console.log('metadata', data)
//     // const images = data.map(dataItem => {
//     data.forEach(dataItem => {
//         // const hasCover = !!dataItem.value.image
//         // if dataItem.value.image exists
//         const hasCover = dataItem.value.hasOwnProperty('image')
//         if (!hasCover) {
//             // alert('no cover')
//             const placeholder = document.createElement('div')
//
//             placeholder.classList.add('placeholder')
//             // placeholder.style.height = '200px'
//             // placeholder.style.width = '200px'
//             // placeholder.classList.add('without-cover')
//             document.body.prepend(placeholder)
//
//             return
//         }
//
//         const buffer = dataItem.value.image.imageBuffer;
//         const blob = new Blob([buffer]);
//         const objectURL = URL.createObjectURL(blob)
//
//         const image = new Image();
//         image.style.height = '200px'
//         image.style.width = '200px'
//         image.onload = () => image.classList.add('loaded')
//         image.src = objectURL
//         // 0
//         document.body.prepend(image)
//     })
// })
//


const htmlConsole = document.querySelector('#js-console')
// const tracksCounter = document.querySelector('#js-added-tracks-counter')
// const tracksCounter = document.querySelector('#track-count-summary')
const tracksCounter = document.querySelector('#js-track-count-summary')

const addToHTMLConsole = (html) => {
    htmlConsole.innerHTML += html
}

// const increaseTracksCounter = (newTracksAmount) => {
//     const currentCount = +tracksCounter.innerHTML // get html string and convert it to a number
//     const newCount = currentCount + newTracksAmount
//
//     tracksCounter.innerHTML = newCount
// }
const updateTracksCounter = ({action, numberOfNewTracks, numberOfAllTracksInAPlaylist}) => {
    if (action === 'add') {
        const currentCount = +tracksCounter.getAttribute('data-current-count') // get current count and convert it to number
        const updatedCount = currentCount + numberOfNewTracks

        tracksCounter.innerHTML = updatedCount === 1 ?
            'there is 1 track in a playlist' :
            `there are ${updatedCount} tracks in a playlist`;

        tracksCounter.setAttribute('data-current-count', updatedCount)
    }

    if (action === 'reset') {
        tracksCounter.innerHTML = 'there are no tracks in a playlist'
        tracksCounter.setAttribute('data-current-count', '0')
    }
}

window.electronAPI.tracksAddedToAPlaylist(({addedTracks: tracks}) => { // get value addedTracks from recieved object, and use it as its a variable called "tracks"
    const onlyOneTrack = tracks.length === 1

    const html = `
      <li class="console-item">
        ${onlyOneTrack ? '1 track is added' : 
          // `${tracks.length} tracks are added`
          tracks.length + 'tracks are added'
        }
        
        to the playlist
      </li>
    `

    updateTracksCounter({action: 'add', numberOfNewTracks: tracks.length})
    addToHTMLConsole(html)
})

const deletePlaylistButton = document.querySelector('#js-delete-local-playlist')
deletePlaylistButton.onclick = () => {
    window.electronAPI.deleteAPlaylist()
}


window.electronAPI.trackWasUploaded(({uploadedTrack, newlyUploadedTracksCount, allUploadedTrackCount}) => {
    const trackCover = uploadedTrack.cover?.httpsCoverUrl
    // const trackname = uploadedTrack.trackname
    const filename = uploadedTrack.filename

    const coverHTML = trackCover ?
        `track cover: <img class="cover" src="${trackCover}" alt="${filename} cover">` :
        'track has no cover'

    const html = `
      <li class="console-item">
        started uploading of a 1st track
        track info:
        filename: ${filename}
        ${coverHTML}
      </li>
    `
    // trackname: ${trackname}
    // track cover: <img src="${trackCover}" alt="${trackname}'s cover">

    // enable this button, sinse there are now tracks to delete
    deletePlaylistButton.disabled = false

    addToHTMLConsole(html)
})


window.electronAPI.playlistDeleted(() => {
    // local playlist is already deletede on a local server,
    // so clean up the view on a client side
    tracksCounter.innerHTML = '0'

    // disable "delete a playlist" button, sinse there is no playlist and hense nothing to delete
    deletePlaylistButton.disabled = true

    addToHTMLConsole('<li class="console-item">local playlist was deleted</li>')

    updateTracksCounter({action: 'reset'})
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

