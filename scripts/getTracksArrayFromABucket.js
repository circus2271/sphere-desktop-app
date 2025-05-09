// Import the required AWS SDK clients and commands
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import 'dotenv/config'
import fs from "fs";

export const {
    ACCESS_KEY_ID,
    SECRET_ACCESS_KEY,
    ACCOUNT_ID,
} = process.env


// export const S3 = new S3Client({
export const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

// export const s3 = new S3Client({
//     region: "auto",
//     endpoint: `https://storage.yandexcloud.net`,
//     credentials: {
//         accessKeyId: 'YCAJEFn0ch4qoB9j6kR5w',
//         secretAccessKey: 'YCP3LQbuDDixJC0EkcM8HP771hJDmKSyYCbCW0z',
//     },
// });

const time = new Date().getTime()

// async function listFilesInFolder(bucketName, folderPrefix) {
async function listFilesInFolder() {
    let tracks = [];
    let continuationToken = null;
    const folderPrefix = 'musicLibrary/'

    do {
        const params = {
            Bucket: 'sphere-bucket',
            Prefix: folderPrefix, // Specify the folder prefix

            ContinuationToken: continuationToken, // Use the continuation token for pagination
        };

        try {
            const command = new ListObjectsV2Command(params);
            const data = await s3.send(command);
            const newTracks = data.Contents
                .filter(item => item.Key.endsWith('.mp3'))
                .map(track => track.Key.replace(folderPrefix, ''))


            tracks.push(...newTracks)

            // Check if there are more files to fetch
            continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
        } catch (error) {
            console.error('Error fetching files:', error);
            return [];
        }
    } while (continuationToken); // Continue until there are no more files

    return tracks;
}

listFilesInFolder()
    .then(tracks => {
        // files.forEach(console.log)
        const time2 = new Date().getTime()
        const timePassed = (time2 - time) / 1000
        console.log('seconds passed:', timePassed)
        // console.log('Files in folder:', files.length);
        console.log('Files in folder:', tracks.length);
        // console.log('File:', tracks[10]);
        // fs.writeFileSync(`cloudflare-tracks.json`, JSON.stringify(tracks), 'utf8')//, (err) => {
        fs.writeFileSync(`yandex-mirror-tracks.json`, JSON.stringify(tracks), 'utf8')//, (err) => {

    })
    .catch(error => {
        console.error('Error:', error);
    });
