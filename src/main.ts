import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import * as fs from 'fs';
import {processFile, processFiles} from './helpers/audioProcessing';

import {getName} from './t';
import {audioProcessingOutputFolder, getTracksData, splitDataIntoChunks} from './helpers/helpers';
import {Uploader} from "./helpers/Uploader";
import {Playlist} from "./helpers/Playlist";
import {DataToProcess, Track} from "./helpers/types";
import async from "async";

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

  ipcMain.on('deleteAPlaylist', () => {
    playlist.deleteLocalPlaylist()
    playlist.deleteUploadedTracksInfo()

    console.log('local playlist is deleted')
    console.log('local information about uploaded tracks is also deleted')
    notifyClient('localPlaylistDeleted')
  })

  type notificationType = 'tracksAdded' | 'localPlaylistDeleted' | 'trackUploaded'
  // const notification = {
  //
  // }


  const notifyClient = (notificationType: notificationType, data?: Track | Track[]) => {
    if (notificationType === 'tracksAdded') {
      // mainWindow.webContents.send('notifyClient:tracksAdded', {allTracks: playlist.getTracks()})
      mainWindow.webContents.send('notifyClient:tracksAdded', {addedTracks: data})
    }

    if (notificationType === 'trackUploaded') {
      // if (Array.isArray(data)) {
      // // if (data instanceof Array) {
      //   console.error('notifyClient: wrong data parameter provided. it should be track object instead of array of tracks')
      // }

      mainWindow.webContents.send('notifyClient:trackUploaded', {
        uploadedTrack: data,
        // newlyUploadedTracksCount: (data as Track[]).length,
        allUploadedTrackCount: playlist.uploadedTracksAmount})
    }
    if (notificationType === 'localPlaylistDeleted') {
      mainWindow.webContents.send('notifyClient:localPlaylistWasDeleted')
    }
  }

  const cargo = async.cargo( async (data, cargoCallback) => {

    const localUrls = (data as DataToProcess).map(dataItem => dataItem.localUrl)
    const playlistHashTag = (data as DataToProcess)[0].playlistHashTag // it's stupid but it works (hopefully..)

    // const alreadyUploadedTracks = playlist.getUploadedTracks()
    const uniqueTrackFilenames = playlist.uniqueTrackFilenames

    // remove already uploaded tracks
    const newUrls = localUrls.filter(localUrl => {
      const newFilename = path.parse(localUrl).base

      const alreadyAdded = uniqueTrackFilenames.find(filename => {
        return filename === newFilename
      })

      return !alreadyAdded
    })

    if (newUrls.length === 0) {
      // console.log('no unique tracks were added, so playlist remains the same')
      console.log('all dropped files are already uploaded. exit')

      // nothing to process
      cargoCallback()
      return
    }

    // не идеально, но может сэкономить время
    // нам нужно проверять, какие трэки у нас новые, а какие у нас уже есть
    // те трэки, которые у нас уже есть, мы повторно не добавляем и не обрабатываем
    //
    // если мы закидываем сразу несколько плейлистов, они начинаются добавляться одновременно
    // в идеале, у нас должна быть отдеальная очередь и на проверку трэков тоже
    const newFilenames = newUrls.map(url => path.parse(url).base)
    playlist.uniqueTrackFilenames.push(...newFilenames)

    const newTracks: Track[] = await getTracksData(newUrls, playlistHashTag)


    console.log('new tracks data:', newTracks)

    playlist.addTracks(newTracks)
    console.log('amount of tracks in playlist:', playlist.tracksAmount)
    notifyClient('tracksAdded', newTracks)

    // by now, tracks are filtered, and only unique tracks are added to the playlist
    // mainWindow.webContents.send('playlistIsReadyToBeUploaded')
    // console.log('sending a playlist..')
    console.log(`sending unique ${newTracks.length === 1 ? 'track' : 'tracks'}..`)




    // console.log('start processing of new cargo portion')
    console.log('start processing of a new tracks portion')
    console.log('portion length is', newTracks.length)
    const modifiedTracks: Track[] = []
    const queue = async.queue(async (track: Track, queueCallback) => {
      // process item
      // item.processed = true
      try {
        const modifiedTrack = await processFile(track, audioProcessingOutputFolder)
        modifiedTracks.push(modifiedTrack)
      } catch (error) {
        console.error(error)
        console.error('error when trying to process track', track.trackname)
      }
      queueCallback()
    }, 5) // process 5 items in parallel (maximum)

    //when all items are processed
    // await queue.drain()
    queue.drain(async () => {
      if (modifiedTracks.length === 0) {
        console.log('no tracks in this chunk are processed')

        // notify "library" that it may finish processing of this tracks chunk (portion of tracks)
        // after this callback, the library may start processing of another tracks portion
        cargoCallback()
        return
      }
      console.log('all items in portion are processed')
      console.log('processed items', modifiedTracks)
      // cargoCallback() // start processing new portions of items (if any in cargo)

      // console.log('chunk', chunk.cover)
      // await Uploader.uploadTracksToCloudflareR2(chunk)
      const uploadedTracks = []
      for await (const track of modifiedTracks) {
        // add track duration
        // do it here, because here audio file is already processed
        track.airtableData.duration = track.processedFileDuration

        // try to upload the track
        // try to upload the cover

        // try {
          const uploadedTrackUrl = await Uploader.uploadTrackToCloudflareR2(track)
          if (uploadedTrackUrl) {
            track.airtableData.trackUrl = uploadedTrackUrl
            const cover = track.cover
            // const hasCover = track.hasOwnProperty('cover')
            if (cover) {
              const trackname = track.trackname
              const uploadedCoverUrl = await Uploader.uploadTrackCoverToCloudflareR2(cover, trackname)

              // cover.httpsCoverUrl = uploadedCoverUrl
              // track.cover = cover // sorry..
              if (uploadedCoverUrl) {
                track.airtableData.image = [
                  {
                    url: uploadedCoverUrl
                  }
                ]
              }
            }

            uploadedTracks.push(track)
            playlist.addSingleUploadedTrack(track)
            notifyClient('trackUploaded', track)        }

        // } catch (error) {
        //     console.error(error) // hope
        // }
      }


      // playlist.addMultipleUploadedTracks(uploadedTracks)
      // console.log('upt', playlist.getUploadedTracks()

      // if (uploadedTracks.length === 0) {
      //   cargoCallback()
      // }

      try {
        await Uploader.uploadPlaylistToAirtable(uploadedTracks)

        // if everything ok, remove tracks from output folder (delete them)
        //   https://stackoverflow.com/a/42182416/9675926


        const outputFolderFiles = fs.readdirSync(audioProcessingOutputFolder);

        outputFolderFiles.forEach(file => {
          const filePath = path.join(audioProcessingOutputFolder, file);

          if (path.extname(file) === '.mp3') {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        });
      } catch (error) {
        console.log(error)
      }

      // notify "library" that it may finish processing of this tracks chunk (portion of tracks)
      // after this callback, the library may start processing of another tracks portion
      cargoCallback()
    })

    queue.push(newTracks)
  }, 10)

  cargo.drain(() => {
    console.log('All items in group have been processed');
  });

  ipcMain.on('dragAndDrop', async (_event, folderPath: string) => {

    const files = fs.readdirSync(folderPath);
    const playlistHashTag = path.parse(folderPath).name
    const mp3Files = files.filter(file => {
      return path.extname(file) === '.mp3';
    });
    const localUrls = mp3Files.map(filename => path.resolve(folderPath, filename))
    //   cargo.push(chunk)

    const data: DataToProcess = localUrls.map(url => {
      return {
        localUrl: url,
        playlistHashTag: playlistHashTag
      }
    })

    cargo.push(data)
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
