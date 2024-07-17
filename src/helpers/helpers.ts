import 'dotenv/config'

import {S3Client, S3ClientConfig,} from "@aws-sdk/client-s3";
import {Cover, Track} from "./types";
import {parseFile} from "music-metadata";
import {IAudioMetadata} from "music-metadata/lib/type";
import path from "path";

export const {
    PERSONAL_ACCESS_TOKEN,
    BASE_ID,
    FIRST_TABLE_ID,
    ACCESS_KEY_ID,
    SECRET_ACCESS_KEY,
    ACCOUNT_ID,
    CLOUDFLARE_R2_PUBLIC_ENDPOINT
} = process.env


export const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
} as S3ClientConfig);

export const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${FIRST_TABLE_ID}`




export const splitDataIntoChunks = (data: Track[], chunkSize = 10) => {
    // split data into chunks to bypass airtabble api limit
    // (send no more then 10 items per request)
    const chunks = [] // array of arrays

    for (let i = 0; i < data.length; i += chunkSize) {
        // 0, 10
        // 10, 20
        // 30, 40
        const portion = data.slice(i, i + chunkSize)
        chunks.push(portion)
    }

    return chunks
}

// export const splitDataIntoChunks = (data: []) => {
//     // split data into chunks to bypass airtabble api limit
//     // (send no more then 10 items per request)
//     const chunks = [] // array of arrays
//
//     for (let i = 0; i < data.length; i+=10) {
//         // 0, 10
//         // 10, 20
//         // 30, 40
//         const portion = data.slice(i, i +10)
//         chunks.push(portion)
//     }
//
//     return chunks
// }

// function returns promise and a track array inside that promise
export async function getTracksData(localUrls: string[]): Promise<Track[]> {
    const tracks: Track[] = []

    for await (const url of localUrls) {
        const filepath = url
        const filename = path.parse(filepath).base
        const trackname = path.parse(filepath).name

        const trackMetadata: IAudioMetadata = await parseFile(filepath)
        const duration= trackMetadata.format.duration
        const picture = trackMetadata.common.picture

        const track: Track = {
            duration: `${duration?.toFixed(1)}`,
            filepath,
            filename,
            trackname
        }

        if (picture) {
            const firstPicture = picture[0]

            track.cover = {
                imageBuffer: firstPicture.data,
                mime: firstPicture.format
            }
        }

        tracks.push(track)
    }

    return tracks
}



