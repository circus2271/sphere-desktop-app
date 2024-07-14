// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')
// const {Track} = require("./helpers/types");

contextBridge.exposeInMainWorld('electronAPI', {
    sendFilePaths: (data) => ipcRenderer.send('dragAndDrop', data),
    onMetaDataRecieve: (callback) => ipcRenderer.on('metadata', (_event, dataArray) => callback(dataArray)),
    // uploadPlaylist: (playlist) => ipcRenderer.send('upload-playlist', playlist),
    sendAPlaylist: () => ipcRenderer.send('sendAPlaylist'),
    startPlaylistUploading: () => ipcRenderer.send('uploadingAPlaylistStarted'),
    playlistIsReadyToBeUploaded: (callback) => ipcRenderer.on('playlistIsReadyToBeUploaded', (_event) => callback()),

    // working with client notification (when something happens on a server side)
    tracksAddedToAPlaylist: (callback) => {ipcRenderer.on('notifyClient:tracksAdded', (_event, obj) => callback(obj))},
    // trackWasUploaded: (callback) => {ipcRenderer.on('notifyClient:trackUploaded', (_event, obj) => callback(obj))},
    trackWasUploaded: (callback) => {ipcRenderer.on('notifyClient:trackUploaded', (_event, obj) => callback(obj))},
    playlistDeleted: (callback) => {ipcRenderer.on('notifyClient:localPlaylistWasDeleted', (_event) => callback())},

    deleteAPlaylist: () => ipcRenderer.send('deleteAPlaylist'),



})

