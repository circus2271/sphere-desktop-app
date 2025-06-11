import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import fetch from 'node-fetch'; // to

const __filename = fileURLToPath(import.meta.url);
//
// const url = 'https://example.com/file.zip'; // Replace with your file URL
// const filePath = path.join(__dirname, 'file.zip'); // Path where you want to save the file


const outputFolder = path.join(__filename, '../output') // ...


const notDownloadedTracks = []
const downloadedTracks = []

const downloadTracks = async (urls) => {
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
    }

    console.log(`all tracks are attempted to be downloaded`)
    // console.log(`${downloadedTracks.length} of ${tracks.length} were downloaded`)
    console.log(`${downloadedTracks.length} of ${urls.length} were downloaded`)
    console.log(`${notDownloadedTracks.length} are not downloaded`)

    console.log('not downloaded tracks array:', notDownloadedTracks)


}

// Function to download the file
// not very intuitive..
async function downloadFile(url) {
    const encodedTrackName = url.split('/').pop()
    const trackName = decodeURIComponent(encodedTrackName)

    console.log(`attempting to download ${trackName}`)

    let response;
    try {
        response = await fetch(url)
    } catch(err) {
        throw new Error(`fetch error`);
    }

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Create a writable stream to save the file
    const filePath = path.join(outputFolder, trackName)
    const dest = fs.createWriteStream(filePath);

    // using "reponse.body" doen't work here
    // convert it as is described here: https://github.com/lovell/sharp/issues/4013#issuecomment-1968847107
    // that way it works..
    console.log('response was ok', response.ok)

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


export function splitDataIntoChunks(data, chunkSize = 10) {
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



// const tracks = [
//     ... those tracks (urls) will be proceed further in code)
// ]


// import tracks from '../diff-tracks.json' assert { type: 'json' }
// // downloadTracks({index: 2, urls: tracks2})
// (async () => {
//     // await downloadTracks({index: 4, urls: tracks4})
//     await downloadTracks({index: 4, urls: tracks})
// })()


// (async () => {
    // await downloadTracks({index: 4, urls: tracks4})
// })()

await downloadTracks(tracks)
