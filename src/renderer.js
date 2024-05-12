/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via Vite');

const setButton = document.getElementById('btn')
// const titleInput = document.getElementById('title')
setButton.addEventListener('click', () => {
    // const title = titleInput.value
    console.log('time update requested')
    // window.electronAPI.setTitle('fhsd22')
    window.electronAPI.requestTimeUpdate()
})

window.electronAPI.onTimeUpdate((value) => {
    console.log(value)
})

// drag and drop

const container = document.querySelector('.container')

container.addEventListener('dragenter', (e) => {
    container.classList.add('active')
})

container.addEventListener('dragleave', (e) => {
    if (e.target === container)
    container.classList.remove('active')
})

// container.addEventListener('click', (e) => {
//   container.classList.toggle('active')
// })


container.addEventListener('dragover', e => {
    // without this an image will be opened in a new tab
    e.preventDefault()
})

container.addEventListener('drop', e => {
    // without this an image will be opened in a new tab
    e.preventDefault()

    console.log('sfd')
    const files = e.dataTransfer.files
    const filenames =[]
    // console.log(files[0])
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(file.name)
        filenames.push(file.name)
//        filenames.push(file.path)
    }

//    const fileNames = files.map(file => file.name)
    window.electronAPI.sendFileNames(filenames)

    container.classList.remove('active')
})

// container.addEventListener('dragover', (e) => {
//   e.preventDefault()
//   e.stopPropagation();
//   e.preventDefault();
//   container.classList.add('active')
//  // console.log('dragover') container.classList.remove('active')
// })