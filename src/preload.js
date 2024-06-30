// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    sendFilePaths: (data) => ipcRenderer.send('dragAndDrop', data),
    onMetaDataRecieve: (callback) => ipcRenderer.on('metadata', (_event, dataArray) => callback(dataArray)),
    // uploadPlaylist: (playlist) => ipcRenderer.send('upload-playlist', playlist),
    sendAPlaylist: () => ipcRenderer.send('sendAPlaylist'),
    startPlaylistUploading: () => ipcRenderer.send('uploadingAPlaylistStarted'),
    playlistIsReadyToBeUploaded: (callback) => ipcRenderer.on('playlistIsReadyToBeUploaded', (_event) => callback()),
})

