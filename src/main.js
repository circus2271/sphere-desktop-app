const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const NodeID3 = require('node-id3');
const fs = require('fs');


// const audioFilePath = 'path/to/your/audio/file.mp3';
// const audioFilePath = 'D:\\╨┐╤С╤Б ╨╕ ╨│╤А╤Г╨┐╨┐╨░ - 2011 - ╨Ф╨▓╨░ ╨╗╨╕╤Ж╨░\\05. ╨б╨░╨╝╨╛╨╗╤С╤В.flac\n';
// const audioFilePath = 'D%3A%5C%D0%BF%D1%91%D1%81%20%D0%B8%20%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0%20-%202011%20-%20%D0%94%D0%B2%D0%B0%20%D0%BB%D0%B8%D1%86%D0%B0%5C05.%20%D0%A1%D0%B0%D0%BC%D0%BE%D0%BB%D1%91%D1%82.flac';
// const audioFilePath = `D:\пёс и группа - 2011 - Два лица\09. Постарайся не забывать.flac`
//
// NodeID3.read(audioFilePath, function(err, tags) {
//   if (err) {
//     console.error(err);
//   } else {
//     const durationInSeconds = tags.duration;
//     console.log('Duration of the audio file:', durationInSeconds, 'seconds');
//   }
// });
//
// const filePath = 'C:\\Users\\Username\\Documents\\файл.txt'; // Example file path with Russian symbols
// const filePath = 'C:\\Users\\user\\Pictures\\╨д╨╛╨╜╨╛╨▓╤Л╨╡ ╨╕╨╖╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╤П ╤А╨░╨▒╨╛╤З╨╡╨│╨╛ ╤Б╤В╨╛╨╗╨░\\dsfsdfsd.jpg\n'
// const normalizedPath = path.normalize(filePath);
// const readablePath = path.resolve(normalizedPath);
// console.log('p', readablePath)
// process.stdout.setEncoding('utf8');

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

  ipcMain.on('file paths', async  (_event, filePaths) =>{
    console.log('recieved filePaths: ')
    let counter = 0;
    // console.log('typeof filepaths')
    const promises = filePaths.map(filepath => {
      return new Promise((resolve, reject) => {
        NodeID3.read(filepath, function(error, tags) {
          if (error) {
            console.error(err);
            reject(error)
          } else {
            console.log(tags)
            // const durationInSeconds = tags.duration;
            // const durationInSeconds = tags.length / 1000 ;
            // console.log('Duration of the audio file:', durationInSeconds, 'seconds');
            resolve(tags)
          }
        })
      })
    })

    // const data = await Promise.allSettled(promises)
    const metadata = await Promise.allSettled(promises)
    // console.log('data..', data)
    console.log('data..', metadata)
    mainWindow.webContents.send('metadata', metadata)
    //
    // for (let i = 0; i < filePaths.length; i++) {
    //   const path =  filePaths[i]
    //   console.log(path)
    //
    //   const audioFilePath = path;
    //
    //   // const tags = NodeID3.read(audioFilePath, function(err, tags) {
    //   //   if (err) {
    //   //     console.error(err);
    //   //   } else {
    //   //     console.log(tags)
    //   //     // const durationInSeconds = tags.duration;
    //   //     const durationInSeconds = tags.length / 1000 ;
    //   //     console.log('Duration of the audio file:', durationInSeconds, 'seconds');
    //   //   }
    //   // });
    //
    //   console.log('originalfilename', tags.originalFilename)
    //   console.log('counter', ++counter)
    //
    //
    // }
  })

//  ipcMain.on('files', (_event, files) =>{
//    console.log('recieved files: ')
//    for (let i = 0; i < files.length; i++) {
//      const file =  files[i]
//      console.log(file.path)
//    }
//  })

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
