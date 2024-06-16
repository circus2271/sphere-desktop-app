import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import {getName} from './t';
// import { createAirtableData, parseMetadataFromImages, uploadPlaylistDataToAirtable } from './helpers/helpers';
// import { createAirtableData,  uploadPlaylistDataToAirtable } from './helpers/helpers';
import { getTracksData, uploadPlaylistDataToAirtable } from './helpers/helpers';
import {Playlist, Uploader} from './helpers/typescript';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.on('request-time-update', (_event, value) => {
    console.log(value) // will print value to Node console
    // setTimeout(() => {
    //   mainWindow.webContents.send('update-counter', 1),
    // }, 1000)
    let counter = 0
    let interval = setInterval(() => {
      console.log(new Date().getSeconds())
      mainWindow.webContents.send('time-update', new Date().getSeconds())

      counter++
      if (counter == 12) clearInterval(interval)
      if (counter == 12) mainWindow.webContents.send('time-update', 'ёлл')
    }, 1000)
  })

  ipcMain.on('filenames', (_event, filenames) =>{
    console.log('recieved filenames: ')
    for (let i = 0; i < filenames.length; i++) {
      const filename =  filenames[i]
      console.log(filename)
    }
  })

  ipcMain.on('upload-playlist', (_event, playlistMetaData) =>{
    console.log('upload-playlist: playlist recieved')

    // const airtableData = createAirtableData(playlistMetaData)
    // send this data to airtable to create records

    // console.log('playlist length:', playlistMetaData.length)
    // console.log('records11', records)

  })

  const playlist = new Playlist()

  ipcMain.on('file data', async (_event, fileData) => {
    // console.log('recieved filePaths: ')
    let counter = 0;
    // console.log('typeof filepaths')
    // const filePaths = fileData.map(f => f.filePath)
    // const metadata = await parseMetadataFromImages(filePaths)
    // console.log('vitttte')
    // return
    const metadata = await playlist.parseMetaData(fileData)
    console.log('metadaaa', metadata)
    const tracks = getTracksData(metadata)
    // playlist.addTrack()
    playlist.addTracks(tracks)

    console.log('amount of tracks in playlist:', playlist.tracksAmount)
    // const metadata = playlistparseMetadataFromImages(fileData)
    // console.log('data..', metadata)

    ipcMain.on('sendAPlaylist', () => {
      console.log('sending a playlist..')

      const tracks = playlist.getTracks()
      Uploader.uploadTracksToCloudflareR2(tracks)
    })

    mainWindow.webContents.send('metadata', metadata)
    mainWindow.webContents.send('playlistIsReadyToBeUploaded')

    return
    // const dataToUpload = createAirtableData(metadata);

    // upload this data to airtable as json
    // const response = await uploadPlaylistDataToAirtable(dataToUpload)
    // console.log('resp', response)
  })


  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

  const name = getName()
  console.log(name);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  // class Logger {
  //   log() {
  //     console.log('jjj')
  //   }
  // }

  // const logger = new Logger()
  // logger.tagdsf.fsd
  //
  // function getName(person: Person): string {
  //   return person.name
  // }
  //
  // type Person = {
  //   name: string,
  //   age: number
  // }

  // getName('Boris')
  // getName({name: 'Vasya', age: 11})

  // нету
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
