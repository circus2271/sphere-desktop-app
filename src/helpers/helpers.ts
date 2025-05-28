import 'dotenv/config'

import {S3Client, S3ClientConfig,} from '@aws-sdk/client-s3';
import {Track} from './types';
import {parseFile} from 'music-metadata';
import {IAudioMetadata} from 'music-metadata/lib/type';
import path from 'path';

export const {
    PERSONAL_ACCESS_AT_TOKEN,
    BASE_ID,
    FIRST_TABLE_ID,
    CLOUDFLARE_ACCESS_KEY_ID,
    CLOUDFLARE_SECRET_ACCESS_KEY,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_PUBLIC_ENDPOINT,
    YANDEX_ACCESS_KEY_ID,
    YANDEX_SECRET_ACCESS_KEY,
    // YANDEX_ACCOUNT_ID,
    YANDEX_OBJECT_STORAGE_PUBLIC_ENDPOINT
} = process.env


// export const S3 = new S3Client({
export const cloudflareS3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
    },
} as S3ClientConfig);

export const yandexS3Client = new S3Client({
    region: 'auto',
    endpoint: `https://storage.yandexcloud.net`,
    // endpoint: `https://${YANDEX_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: YANDEX_ACCESS_KEY_ID,
        secretAccessKey: YANDEX_SECRET_ACCESS_KEY,
    },
} as S3ClientConfig);


export const mode = {
    sendFiles: true, // if true, sends files to AT and cloudflare; if false, just saves processed files on disk and doesn't send them (and doesn't delete them)
    sendFilesOnlyToCloudflareAndYandex: false,
    showBrowserDevtools: false,

    // sendFilesOnlyToCloudflareAndYandex: true,
    showBrowserDevtools: true,
}

export const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${FIRST_TABLE_ID}`


export const audioProcessingOutputFolder = path.join(__dirname, '../../output')

console.log('audioProcessingOutputFolder', audioProcessingOutputFolder);

export async function getTrackDuration(localUrl: string): Promise<number | null>   {
    const trackMetadata: IAudioMetadata = await parseFile(localUrl)
    // const duration = trackMetadata.format.duration?.toFixed() || ''
    const duration = trackMetadata.format.duration

    return typeof duration === 'number' ? Math.floor(duration) : null
}

// function returns promise and a track array inside that promise
export async function getTracksData(localUrls: string[], playlistHashTag: string): Promise<Track[]> {
    const tracks: Track[] = []

    for await (const url of localUrls) {
        const filepath = url
        const filename = path.parse(filepath).base
        const trackname = path.parse(filepath).name

        const trackMetadata: IAudioMetadata = await parseFile(filepath)
        const duration= trackMetadata.format.duration

        const {
            picture,
            artist,
            album,
            year
        } = trackMetadata.common
        // const picture = trackMetadata.common.picture
        // const artistName = trackMetadata.common.artist
        // const albumName = trackMetadata.common.album
        // const albumYear = trackMetadata.common.year?.toString()

        const track: Track = {
            duration: duration?.toFixed() || '',
            filepath,
            filename,
            trackname,
            airtableData: {
                'artist name': artist || '',
                'album name': album || '',
                'album year': year?.toString() || '',
                'track name': trackname,
                hashtag: playlistHashTag,
                //trackUrl: filepath,
                // duration: `${duration?.toFixed(1)}`,
            }
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