// require('dotenv').config();
import {Tags} from 'node-id3'
// import {Track} from './typescript';
import 'dotenv/config'
// import { Track } from './drafts';

import {
    S3Client, S3ClientConfig,
    // ListBucketsCommand,
    // ListObjectsV2Command,
    // GetObjectCommand,
    // PutObjectCommand
} from "@aws-sdk/client-s3";
import {AirtableTrackItem, Track} from "./types";
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

// export const createAirtableData = (playlistMetaData) => {
export const getTracksData = (playlistMetaData): Track[] => {
// https://stackoverflow.com/a/41385149/9675926
    const data = playlistMetaData.map((songData) => {
        // console.log('songdata', songData.value)
        const duration = `${Math.round(songData.value.length / 1000)}`
        // console.log('duration', duration)
        // console.log('length', songData.value.length)


        return {
                filepath: songData.value.filepath,
                filename: songData.value.filename,
                cover: songData.value.image,
                // how to get trackname without an extension:
                // https://stackoverflow.com/a/31615711/9675926
                trackname: path.parse(songData.value.filename).name,
                duration
            }

    })

    return data
}





