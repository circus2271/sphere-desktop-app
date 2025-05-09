import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import fetch from 'node-fetch'; // to

const __filename = fileURLToPath(import.meta.url);
//
// const url = 'https://example.com/file.zip'; // Replace with your file URL
// const filePath = path.join(__dirname, 'file.zip'); // Path where you want to save the file


const outputFolder = path.join(__filename, '../output') // ...
// const outputFolder = path.join(__filename, './output') // ...

// Function to download the file
async function downloadFile(trackName) {
    // const encodedTrackName = url.split('/').pop()
    // const trackName = decodeURIComponent(encodedTrackName)

    console.log(`attempting to download ${trackName}`)

    let response;
    try {
        response = await fetch('https://spheresounds.cc/musicLibrary/' + trackName);
    } catch(err) {
        throw new Error(`fetch error`);
    }

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Create a writable stream to save the file
    const filePath = path.join(outputFolder, trackName)
    // const dest = fs.createWriteStream(filePath);
    // const dest = fs.createWriteStream(filePath);
    // const dest = fs.createWriteStream(filePath);
    const dest = fs.createWriteStream(filePath);

    // Pipe the response body to the writable stream
    // response.body.pipe(dest);
    // console.log(1)
    // response.body.pipeTo(dest);

    // using "reponse.body" doen't work here
    // convert it as is described here: https://github.com/lovell/sharp/issues/4013#issuecomment-1968847107
    // that way it works..
    console.log('response was ok', response.ok)
    // const convertedSource = Readable.fromWeb(response.body)
    // const convertedSource = Readable.fromWeb(response.body)
    // convertedSource.pipe(dest);
    // console.log(2)

    // Return a promise that resolves when the file is fully written
    const p = new Promise((resolve, reject) => {
        dest.on('finish', () => {
            console.log(`${trackName} is downloaded and saved`)
            resolve()
        });
        dest.on('error', (err) => {
            console.error(err)
            console.warn(`some error happened with ${trackName}`)
            console.warn('the track is skipped')

            reject()
        });
    });

    response.body.pipe(dest);

    return p
}

// Call the function to download the file
// downloadFile(url)
//     .then(() => {
//         console.log('Download completed!');
//     })
//     .catch(err => {
//         console.error(`Error: ${err.message}`);
//     });

export const splitDataIntoChunks = (data, chunkSize = 10) => {
    // split data into chunks to bypass airtabble api limit
    // (send no more then 10 items per request)
    const chunks = [] // array of arrays
    const chunksAmount = Math.ceil(data.length/chunkSize)

    for (let i = 0; i < chunksAmount; i++) {
        // 0, 10
        // 10, 20
        // 30, 40
        const portion = data.slice(i * chunkSize, i * chunkSize + chunkSize)
        chunks.push(portion)
    }

    return chunks
}



const notDownloadedTracks = []
const downloadedTracks = []

const downloadTracks = async ({index, urls}) => {
    const chunks = splitDataIntoChunks(urls)

    for await (let chunk of chunks) {
        const promises = chunk.map(async url => {
            return new Promise((resolve, reject) => {
                downloadFile(url)
                    .then(() => {
                        downloadedTracks.push(url)
                        console.log(`${downloadedTracks.length} are downloaded`)
                        resolve() // track is downloaded
                    })
                    .catch((err) => {
                        console.error(err)
                        // if error, track is not downloaded
                        console.log(`${notDownloadedTracks.length} are not downloaded`)
                        notDownloadedTracks.push(url)
                        reject()
                    })
            })
        })

        await Promise.allSettled(promises)

        // await new Promise(r => {
        //     // setTimeout(r, 5000)
        //     // setTimeout(r, 2500)
        //     setTimeout(r, 2500)
        // })

        // write logs each 10 tracks
        // fs.writeFileSync(`logs-${index}-errors.json`, JSON.stringify(notDownloadedTracks), 'utf8')//, (err) => {
        // //     if (err) {
        // //         // Handle the error
        // //         console.error('Error writing to the file:', err.message);
        // //         return; // Exit the function if there's an error
        // //     }
        // //
        // //     // If no error, confirm the write operation
        // //     console.log('File has been written successfully.');
        // // });

        // fs.writeFileSync(`logs-${index}-downloaded-tracks.json`, JSON.stringify(downloadedTracks), 'utf8')//, (err) => {
        //     if (err) {
        //         // Handle the error
        //         console.error('Error writing to the file:', err.message);
        //         return; // Exit the function if there's an error
        //     }
        //
        //     // If no error, confirm the write operation
        //     console.log('File has been written successfully.');
        // });

    }

    console.log(`all tracks are attempted to be downloaded`)
    // console.log(`${downloadedTracks.length} of ${tracks.length} were downloaded`)
    console.log(`${downloadedTracks.length} of ${urls.length} were downloaded`)
    console.log(`${notDownloadedTracks.length} are not downloaded`)

    console.log('not downloaded tracks array:', notDownloadedTracks)


}

// const tracks = [
//     // ... those tracks (urls) will be proceed further in code)
// ]

import tracks from '../diff-tracks.json' assert { type: 'json' }
// downloadTracks({index: 2, urls: tracks2})
(async () => {
    // await downloadTracks({index: 4, urls: tracks4})
    await downloadTracks({index: 4, urls: tracks})
})()
