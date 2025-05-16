import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import * as fs from 'fs';
import {processFile} from './helpers/audioProcessing';

import {getName} from './t';
import {audioProcessingOutputFolder, getTracksData, mode, splitDataIntoChunks} from './helpers/helpers';
import {Uploader} from './helpers/Uploader';
import {Playlist} from './helpers/Playlist';
import {Track} from './helpers/types';
import async from 'async';

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

  ipcMain.on('modeChanged', async (_event, shouldSendFiles, shouldSendOnlyToS3) => {
    mode.sendFiles = shouldSendFiles
    mode.sendFilesOnlyToCloudflareAndYandex = shouldSendOnlyToS3
  })

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

  type notificationType = 'tracksAdded' | 'localPlaylistDeleted' | 'trackUploaded' | 'couldntSynchronizeTrack'
  // const notification = {
  //
  // }


  const notifyClient = (notificationType: notificationType, data?: Track | Track[]) => {
    if (notificationType === 'tracksAdded') {
      // mainWindow.webContents.send('notifyClient:tracksAdded', {allTracks: playlist.getTracks()})
      mainWindow.webContents.send('notifyClient:tracksAdded', {addedTracks: data})
    }

    if (notificationType === 'trackUploaded') {

      mainWindow.webContents.send('notifyClient:trackUploaded', {
        uploadedTrack: data,
        // newlyUploadedTracksCount: (data as Track[]).length,
        // allUploadedTrackCount: playlist.uploadedTracksAmount,
        // uploadedToYandex: playlist.uploadedToYandex.length,
        // uploadedToCloudflare: playlist.uploadedToCloudflare.length
        uploadedTracksCounter: {
          uploadedToYandex: playlist.uploadedToYandex.length,
          uploadedToCloudflare: playlist.uploadedToCloudflare.length
        }
      })
    }

    // ...
    if (notificationType === 'couldntSynchronizeTrack') {
      // console.log('le',  playlist.notSynchronizedTracks.length)
      mainWindow.webContents.send('notifyClient:couldntSynchronizeTrack', playlist.notSynchronizedTracks.length)
    }

    if (notificationType === 'localPlaylistDeleted') {
      mainWindow.webContents.send('notifyClient:localPlaylistWasDeleted')
    }
  }

  const cargo = async.cargo((items: Track[], cargoCallback) => {
    // console.log('start processing of new cargo portion')
    console.log('start processing of a new tracks portion')
    console.log('portion length is', items.length)
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
    }, 10) // process 10 items in parallel (maximum)
    // }, 5) // process 5 items in parallel (maximum)

    //when all items are processed
    // await queue.drain()
    queue.drain(async () => {
      // if all tracks in portion are proceed,
      // don't wait for tracks to upload,
      // upload them immediately
      // and also immediately start to process next track portion
      cargoCallback()

      if (modifiedTracks.length === 0) {
        console.log('no tracks in this chunk are processed')

        // notify "library" that it may finish processing of this tracks chunk (portion of tracks)
        // after this callback, the library may start processing of another tracks portion
        // cargoCallback()
        // return
      }
      console.log('\nall items in portion are processed')
      // console.log('processed items', modifiedTracks)
      console.log('processed items amount:', modifiedTracks.length)
      // console.log('\n')
      console.log('')


      if (!mode.sendFiles) {
        console.warn('tracks are processed, but current mode doesn\'t send files to AT and cloudflare')
        return
      }


      const uploadedTracks: Track[] = []

      for await (const track of modifiedTracks) {
        // add track duration
        // do it here, because here audio file is already processed
        const trackDuration = track.processedFileDuration
        // don't add this to airtableData if couldn't parse duration from a file
        if  (trackDuration) {
          track.airtableData['duration sec'] = trackDuration
        }

        // try to upload the track
        // try to upload the cover


        // try to upload a track (retry up to 5 times maximum)
        // let uploadedTrackUrl;
        let cloudflareUrl, yandexUrl;
        let uploaded = false
        let attemptsCounter = 0
        do {
          if (attemptsCounter >= 1) console.log('trying to upload a track, attempt number is', attemptsCounter)
          // yandex comes first, because logs for uploading a track and a cover to cloudflare will go together
          if (!yandexUrl) {
            yandexUrl = await Uploader.uploadTrackToYandexObjectStorage(track)
          }
          if (!cloudflareUrl) {
            cloudflareUrl = await Uploader.uploadTrackToCloudflareR2(track)
          }
          if (cloudflareUrl && yandexUrl) uploaded = true
          if (!uploaded) attemptsCounter++
          // console.log('time (seconds)', new Date().getSeconds())
        } while (!uploaded && attemptsCounter < 5)

        // console.log('cl', cloudflareUrl)
        // console.log('y', yandexUrl)


        if (cloudflareUrl) {
          track.airtableData['Full link'] = cloudflareUrl
          const cover = track.cover

          if (cover) {
            const trackname = track.trackname
            const uploadedCoverUrl = await Uploader.uploadTrackCoverToCloudflareR2(cover, trackname)

            if (uploadedCoverUrl) {
              track.airtableData.image = [
                {
                  url: uploadedCoverUrl
                }
              ]
            }

            delete track.cover
          }

          track.uploadedToCloudflare = true
        }

        if (yandexUrl) {

          track.uploadedToYandexObjectStorage = true
        }

        console.log('') // for empty line
        uploadedTracks.push(track)
        playlist.addSingleUploadedTrack(track)
        notifyClient('trackUploaded', track)

      }


      try {
        if (!mode.sendFilesOnlyToCloudflareAndYandex) {

          await Uploader.uploadPlaylistToAirtable(uploadedTracks)
        }

        // if everything ok, remove tracks from output folder (delete them)
        //   https://stackoverflow.com/a/42182416/9675926

        // delete tracks from output folder
        // delete only those tracks, that were processed in current track chunk
        const outputFolderFiles = fs.readdirSync(audioProcessingOutputFolder);
        for (const uploadedTrack of uploadedTracks) {
          // delete track if track is uploaded
          // if (uploadedTrack.uploadedToCloudflare && uploadedTrack.uploadedToYandexObjectStorage) {
          if (!uploadedTrack.uploadedToCloudflare || !uploadedTrack.uploadedToYandexObjectStorage) {
            // track is not uploaded, so don't delete it from output folder

            playlist.notSynchronizedTracks.push(uploadedTrack)
            // notifyClient('couldSynchronizeTrack', uploadedTrack)
            notifyClient('couldntSynchronizeTrack')

            // return
            continue
          }

          if (outputFolderFiles.includes(uploadedTrack.filename)) {
            const filePath = path.join(audioProcessingOutputFolder, uploadedTrack.filename);

            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        }
      } catch (error) {
        console.log(error)
      }

      // notify "library" that it may finish processing of this tracks chunk (portion of tracks)
      // after this callback, the library may start processing of another tracks portion
      // cargoCallback()
    })



    queue.push(items)
  }, 10)

  ipcMain.on('dragAndDrop', async (_event, folderPath: string) => {

    const files = fs.readdirSync(folderPath);

    const playlistHashTag = path.parse(folderPath).name

    const mp3Files = files.filter(file => {
      return path.extname(file) === '.mp3';
    });

    const localUrls = mp3Files.map(filename => path.resolve(folderPath, filename))

    // const alreadyUploadedTracks = playlist.getUploadedTracks()
    const uniqueTrackFilenames = playlist.uniqueTrackFilenames

    // remove already uploaded tracks
    const newUrls = localUrls.filter(localUrl => {
      const newFilename = path.parse(localUrl).base

      const alreadyUploaded = uniqueTrackFilenames.find(filename => {
        return filename === newFilename
      })

      return !alreadyUploaded
    })

    if (newUrls.length === 0) {
      // console.log('no unique tracks were added, so playlist remains the same')
      console.log('all dropped files are already uploaded. exit')

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
    // const chunks1 = splitDataIntoChunks(newTracks)
    // // for await (let chunk of chunks) {
    // for await (const chunk of chunks1) {
    //   await processFiles(chunk, audioProcessingOutputFolder)
    // }


    // processFiles(newTracks)

    console.log('new tracks data:', newTracks)

    // mainWindow.webContents.send('tracksData', newTracks)

    playlist.addTracks(newTracks)
    console.log('amount of tracks in playlist:', playlist.tracksAmount)
    notifyClient('tracksAdded', newTracks)

    // by now, tracks are filtered, and only unique tracks are added to the playlist
    // mainWindow.webContents.send('playlistIsReadyToBeUploaded')
    // console.log('sending a playlist..')
    console.log(`sending unique ${newTracks.length === 1 ? 'track' : 'tracks'}..`)

    // tracks = playlist.getTracks().filter()

    // split those tracks into chunks (to bypass AT request limit)
    // split by 10, because AT may get only 10 records per once
    // const chunks = splitDataIntoChunks(newTracks, 2)
    const chunks = splitDataIntoChunks(newTracks)
    for (const chunk of chunks) {
      // start processing a "chunk" of tracks
      cargo.push(chunk)
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
