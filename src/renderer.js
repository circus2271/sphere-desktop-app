import './styles/index.scss';
// import {ipcRenderer} from "electron";

console.log('👋 This message is being logged by "renderer.js", included via Vite');

// const sendButton = document.getElementById('send');
// sendButton.onclick = () => {
//     window.electronAPI.sendAPlaylist();
//     sendButton.disabled = true;
// };

// window.electronAPI.playlistIsReadyToBeUploaded(() => {
//     sendButton.disabled = false;
// });

// use it as follows:
// (just type it to the console and it should change mode (and not to/ or send files to AT and cloudlare))
// window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: { sendFiles: true } } } ) )
// window.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode: { sendFiles: false } } } ) )
window.addEventListener('modeChanged', e => {
    const { sendFiles, shouldSendOnlyToS3 } = e.detail.mode

    if (shouldSendOnlyToS3) {
        window.electronAPI.changeMode(shouldSendOnlyToS3)
        console.log('files will only be uploaded to yandex and cloudflare')

        return
    }

    if (typeof sendFiles === 'boolean') {
        console.log('mode should be changed')
        console.log(sendFiles === true ?
            'now files are supposed to be uploaded to AT and cloudflare'
            : 'now files are not supposed to be uploaded'
        )

        window.electronAPI.changeMode(sendFiles)
    } else {
        console.log('"sendFiles" property supposed to be of type "boolean"')
        console.log('hence, mode stays the same, and remains yet unchanged')
    }

})

const htmlConsole = document.querySelector('#js-console');
const tracksCounter = document.querySelector('#js-track-count-summary');

const addToHTMLConsole = (html) => {
    htmlConsole.innerHTML += html;
};

const updateTracksCounter = ({action, numberOfNewTracks, numberOfAllTracksInAPlaylist}) => {
    document.querySelector('#js-logs-header').removeAttribute('hidden')

    if (action === 'add') {
        const currentCount = +tracksCounter.getAttribute('data-current-count');
        const updatedCount = currentCount + numberOfNewTracks;

        tracksCounter.innerHTML = updatedCount === 1 ?
            'there is 1 track in a playlist' :
            `there are ${updatedCount} tracks in a playlist`;

        tracksCounter.setAttribute('data-current-count', updatedCount);
    }

    if (action === 'reset') {
        tracksCounter.innerHTML = 'there are no tracks in a playlist';
        tracksCounter.setAttribute('data-current-count', '0');
        uploadedTracksCounter.innerHTML = '';
    }
};

window.electronAPI.tracksAddedToAPlaylist(({addedTracks: tracks}) => {
    const onlyOneTrack = tracks.length === 1;

    const html = `
      <li class="console-item">
        ${onlyOneTrack ? '1 track is added' : tracks.length + ' tracks are added'}
        to the playlist
      </li>
    `;

    updateTracksCounter({action: 'add', numberOfNewTracks: tracks.length});
    addToHTMLConsole(html);
});


const synchronizationErrors = document.querySelector('#synchronization-errors')
window.electronAPI.trackIsNotSynchronized((notMirroredTracksAmount) => {
    if (notMirroredTracksAmount) {
        synchronizationErrors.classList.add('visible')
    }

    synchronizationErrors.innerHTML = `
      ${notMirroredTracksAmount === 1 ? 
        '1 track is not mirrored properly' : 
        `${notMirroredTracksAmount} tracks are not mirrored properly`}
    `
});

const deletePlaylistButton = document.querySelector('#js-delete-local-playlist');
if (deletePlaylistButton) {
    deletePlaylistButton.onclick = () => {
        window.electronAPI.deleteAPlaylist();
    };
}

// const uploadedTracksCounter = document.querySelector('#js-uploaded-tracks-info');
// const uploadedToYandexCou
const counters = {
    wrapper: document.querySelector('#js-uploaded-tracks-info'),
    uploadedToYandex: document.querySelector('#yandex-counter'),
    uploadedToCloudflare: document.querySelector('#cloudflare-counter')
}
// window.electronAPI.trackWasUploaded(({uploadedTrack, allUploadedTrackCount}) => {
window.electronAPI.trackWasUploaded(({uploadedTrack, uploadedTracksCounter}) => {
    const uploadedData = uploadedTrack.airtableData

// debugger
    // if there is an image, get that image url
    const trackCover = uploadedTrack.airtableData.image && uploadedTrack.airtableData.image[0].url
    const {filename} = uploadedTrack;
    const duration = uploadedData.duration

    const coverHTML = trackCover ?
        `track cover: <img class="cover" src="${trackCover}" alt="${filename} cover">` :
        'track has no cover';

    const html = `
      <li class="console-item">
        track info:
        filename: ${filename} 
        duration: ${duration}
        ${coverHTML}
      </li>
    `;

    // ...
    if (counters.uploadedToYandex || counters.uploadedToCloudflare) {
        // counters.wrapper.removeAttribute('hidden')
        counters.wrapper.classList.remove('hidden')
    }


    // uploadedTracksCounter.innerHTML = allUploadedTrackCount === 1 ?
    //     `1 track is uploaded` :
    //     `${allUploadedTrackCount} tracks are uploaded`;
    counters.uploadedToYandex.innerHTML = uploadedTracksCounter.uploadedToYandex === 1 ?
        `&nbsp;&nbsp;> 1 track is uploaded to yandex` :
        `&nbsp;&nbsp;> ${uploadedTracksCounter.uploadedToYandex} tracks are uploaded to yandex`

    counters.uploadedToCloudflare.innerHTML = uploadedTracksCounter.uploadedToCloudflare === 1 ?
        `&nbsp;&nbsp;> 1 track is uploaded to cloudflare` :
        `&nbsp;&nbsp;> ${uploadedTracksCounter.uploadedToCloudflare} tracks are uploaded to cloudflare`

    // deletePlaylistButton.disabled = false;
    addToHTMLConsole(html);
});

window.electronAPI.playlistDeleted(() => {
    tracksCounter.innerHTML = '0';
    // deletePlaylistButton.disabled = true;
    addToHTMLConsole('<li class="console-item">local playlist was deleted</li>');
    updateTracksCounter({action: 'reset'});
});

// drag and drop

const container = document.querySelector('.container');

container.addEventListener('dragenter', (e) => {
    container.classList.add('active');
});

container.addEventListener('dragleave', (e) => {
    if (e.target === container)
        container.classList.remove('active');
});

container.addEventListener('dragover', e => {
    e.preventDefault();
});

container.addEventListener('drop', e => {
    e.preventDefault();

    // sendButton.disabled = true;


    for (let item of event.dataTransfer.items) {
        if (item.kind === 'file' && item.webkitGetAsEntry().isDirectory) {
            const folderPath = item.getAsFile().path;
            console.log('Dropped folder path:', folderPath);

            window.electronAPI.sendFolderPath(folderPath);
        }
    }

    container.classList.remove('active');

    // const files = e.dataTransfer.files;
    // const filesArray = [...files];
    //
    // const tracks = filesArray.filter(file => file.name.endsWith('.mp3'));
    // const localUrls = tracks.map(track => track.path);
    //
    // if (localUrls.length > 0) {
    //     window.electronAPI.sendFilePaths(localUrls);
    //     // Добавляем вызов для запуска обработки аудио
    //     window.electronAPI.startProcessing(localUrls);
    // }
    //
    // container.classList.remove('active');
});
