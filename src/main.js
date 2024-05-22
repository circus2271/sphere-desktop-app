const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const helpers = require('./index.js');
const {createAirtableData, parseMetadataFromImages, uploadPlaylistDataToAirtable} = require("./helpers");


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

  // ipcMain.on('set-title', (_event, value) => {
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

  ipcMain.on('file paths', async  (_event, filePaths) =>{
    console.log('recieved filePaths: ')
    let counter = 0;
    // console.log('typeof filepaths')
    const metadata = await parseMetadataFromImages(filePaths)
    console.log('data..', metadata)
    mainWindow.webContents.send('metadata', metadata)

    const dataToUpload = createAirtableData(metadata);

    // upload this data to airtable as json
    const response = await uploadPlaylistDataToAirtable(dataToUpload)
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
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

