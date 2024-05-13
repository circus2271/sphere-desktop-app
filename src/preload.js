// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // setTitle: (title) => ipcRenderer.send('set-title', title),
    requestTimeUpdate: () => ipcRenderer.send('request-time-update'),
    onTimeUpdate: (callback) => ipcRenderer.on('time-update', (_event, value) => callback(value)),
    sendFileNames: (filenames) => ipcRenderer.send('filenames', filenames),
    // sending files this way doesn't work
//    sendFiles: (files) => ipcRenderer.send('files', files),
    sendFilePaths: (paths) => ipcRenderer.send('file paths', paths),
})

