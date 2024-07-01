import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import {getName} from './t';
// import { createAirtableData, parseMetadataFromImages, uploadPlaylistDataToAirtable } from './helpers/helpers';
// import { createAirtableData,  uploadPlaylistDataToAirtable } from './helpers/helpers';
import {getTracksData, splitDataIntoChunks} from './helpers/helpers';
import {Uploader} from "./helpers/Uploader";
import {Playlist} from "./helpers/Playlist";

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


  const playlist = new Playlist()

  ipcMain.on('sendAPlaylist', async () => {
    // console.log('sending a playlist..')
    //
    // const tracks = playlist.getTracks()
    // // split those tracks into chunks (to bypass AT request limit)
    // // split by 10, because AT may get only 10 records per once
    // const chunks = splitDataIntoChunks(tracks, 2)
    // for await (const chunk of chunks) {
    //   console.log('chunk', chunk.cover)
    //   await Uploader.uploadTracksToCloudflareR2(chunk)
    // }
  })

  ipcMain.on('dragAndDrop', async (_event, fileData) => {
    const metadata = await playlist.parseMetaData(fileData)
    console.log('metadaaa', metadata)
    // const tracks = getTracksData(metadata)
    let tracks = getTracksData(metadata)
    playlist.addTracks(tracks)

    console.log('amount of tracks in playlist:', playlist.tracksAmount)

    mainWindow.webContents.send('metadata', metadata)
    mainWindow.webContents.send('playlistIsReadyToBeUploaded')

    console.log('sending a playlist..')

    const alreadyUploadedTracks = playlist.getUploadedTracks()
    // const tracks = playlist.getTracks().filter(track => {
    tracks = playlist.getTracks().filter(track => {
      // if track is already uploaded remove it from tracks array
      const alreadyUploaded = alreadyUploadedTracks.find(uploadedTrack => {
        return uploadedTrack.filename === track.filename
      })

      return !alreadyUploaded
    })
    // tracks = playlist.getTracks().filter()

    // split those tracks into chunks (to bypass AT request limit)
    // split by 10, because AT may get only 10 records per once
    const chunks = splitDataIntoChunks(tracks, 2)
    for await (const chunk of chunks) {
      // console.log('chunk', chunk.cover)
      // await Uploader.uploadTracksToCloudflareR2(chunk)
      const uploadedTracks = []
      for await (const track of chunk) {
        // try to upload the track
        // try to upload the cover
        const uploadedTrackUrl = await Uploader.uploadTrackToCloudflareR2(track)
        if (uploadedTrackUrl) {
          track.uploadedTrackUrl = uploadedTrackUrl
          const cover = track.cover
          if (cover) {
            const trackname = track.trackname
            const uploadedCoverUrl = await Uploader.uploadTrackCoverToCloudflareR2(cover, trackname)

            cover.httpsCoverUrl = uploadedCoverUrl
            track.cover = cover // sorry..
          }

          uploadedTracks.push(track)
        }
      }


      playlist.addUploadedTracks(uploadedTracks)
      // console.log('upt', playlist.getUploadedTracks()
      try {
        await Uploader.uploadPlaylistToAirtable(uploadedTracks)
      } catch (error) {
        console.log(error)
      }
      // console.log('pr:', track)
    }

  })



  // ipcMain.on('upload-playlist', (_event, playlistMetaData) =>{
  //   console.log('upload-playlist: playlist recieved')
  //
  //   // const airtableData = createAirtableData(playlistMetaData)
  //   // send this data to airtable to create records
  //
  //   // console.log('playlist length:', playlistMetaData.length)
  //   // console.log('records11', records)
  //
  // })

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
