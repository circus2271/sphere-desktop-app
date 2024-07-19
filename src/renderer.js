import './styles/index.scss';
// import {ipcRenderer} from "electron";

console.log('👋 This message is being logged by "renderer.js", included via Vite');

const sendButton = document.getElementById('send');
sendButton.onclick = () => {
    window.electronAPI.sendAPlaylist();
    sendButton.disabled = true;
};

window.electronAPI.playlistIsReadyToBeUploaded(() => {
    sendButton.disabled = false;
});

const htmlConsole = document.querySelector('#js-console');
const tracksCounter = document.querySelector('#js-track-count-summary');

const addToHTMLConsole = (html) => {
    htmlConsole.innerHTML += html;
};

const updateTracksCounter = ({action, numberOfNewTracks, numberOfAllTracksInAPlaylist}) => {
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

const deletePlaylistButton = document.querySelector('#js-delete-local-playlist');
deletePlaylistButton.onclick = () => {
    window.electronAPI.deleteAPlaylist();
};

const uploadedTracksCounter = document.querySelector('#js-uploaded-tracks-info');
window.electronAPI.trackWasUploaded(({uploadedTrack, allUploadedTrackCount}) => {
    const trackCover = uploadedTrack.cover?.httpsCoverUrl;
    const {filename, duration} = uploadedTrack;

    const coverHTML = trackCover ?
        `track cover: <img class="cover" src="${trackCover}" alt="${filename} cover">` :
        'track has no cover';

    const html = `
      <li class="console-item">
        track was uploaded
        track info:
        filename: ${filename} 
        duration: ${duration}
        ${coverHTML}
      </li>
    `;
    uploadedTracksCounter.innerHTML = allUploadedTrackCount === 1 ?
        `1 track is uploaded` :
        `${allUploadedTrackCount} tracks are uploaded`;

    deletePlaylistButton.disabled = false;
    addToHTMLConsole(html);
});

window.electronAPI.playlistDeleted(() => {
    tracksCounter.innerHTML = '0';
    deletePlaylistButton.disabled = true;
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

    sendButton.disabled = true;

    const files = e.dataTransfer.files;
    const filesArray = [...files];

    const tracks = filesArray.filter(file => file.name.endsWith('.mp3'));
    const localUrls = tracks.map(track => track.path);

    if (localUrls.length > 0) {
        window.electronAPI.sendFilePaths(localUrls);
        // Добавляем вызов для запуска обработки аудио
        window.electronAPI.startProcessing(localUrls);
    }

    container.classList.remove('active');
});
