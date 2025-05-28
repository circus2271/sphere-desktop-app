// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')
// const {Track} = require("./helpers/types");

contextBridge.exposeInMainWorld('electronAPI', {
    changeMode: (shouldSendFiles, shouldSendOnlyToS3) => ipcRenderer.send('modeChanged', shouldSendFiles, shouldSendOnlyToS3),
    // sendFilePaths: (data) => ipcRenderer.send('dragAndDrop', data),
    sendFolderPath: (folderPath) => ipcRenderer.send('dragAndDrop', folderPath),
    onTracksDataRecieve: (callback) => ipcRenderer.on('tracksData', (_event, tracksData) => callback(tracksData)),
    // uploadPlaylist: (playlist) => ipcRenderer.send('upload-playlist', playlist),
    sendAPlaylist: () => ipcRenderer.send('sendAPlaylist'),
    startPlaylistUploading: () => ipcRenderer.send('uploadingAPlaylistStarted'),
    playlistIsReadyToBeUploaded: (callback) => ipcRenderer.on('playlistIsReadyToBeUploaded', (_event) => callback()),

    // working with client notification (when something happens on a server side)
    tracksAddedToAPlaylist: (callback) => {ipcRenderer.on('notifyClient:tracksAdded', (_event, obj) => callback(obj))},
    // trackWasUploaded: (callback) => {ipcRenderer.on('notifyClient:trackUploaded', (_event, obj) => callback(obj))},
    // trackWasUploaded: (callback) => {ipcRenderer.on('notifyClient:trackUploaded', (_event, track) => callback(track))},
    trackWasUploaded: (callback) => {ipcRenderer.on('notifyClient:trackUploaded', (_event, track, uploadedTracksCounter) => callback(track, uploadedTracksCounter))},
    playlistDeleted: (callback) => {ipcRenderer.on('notifyClient:localPlaylistWasDeleted', (_event) => callback())},

    deleteAPlaylist: () => ipcRenderer.send('deleteAPlaylist'),
    reset: () => ipcRenderer.send('reset'),


    trackIsNotSynchronized: (callback) => {ipcRenderer.on('notifyClient:couldntSynchronizeTrack', (_event, failedTracksAmount) => callback(failedTracksAmount))},


})

