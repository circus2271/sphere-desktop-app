import {Cover, Track} from './types';
import {
    airtableUrl,
    CLOUDFLARE_R2_PUBLIC_ENDPOINT,
    PERSONAL_ACCESS_AT_TOKEN,
    YANDEX_OBJECT_STORAGE_PUBLIC_ENDPOINT,
    cloudflareS3Client,
    yandexS3Client
} from './helpers';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import fs from 'fs';
import axios, {AxiosError} from 'axios';


export class Uploader {

    static async #uploadTrackToS3({track, uploadTo}: {track: Track, uploadTo: 'cloudflare' | 'yandex'}) {
        const fileBuffer = await fs.promises.readFile(track.processedFileLocalUrl as string)

        const bucketPath = `musicLibrary/${track.filename}`



        //...
        const client = uploadTo === 'cloudflare' ? cloudflareS3Client : yandexS3Client
        const storagePublicEndpoint = uploadTo === 'cloudflare' ? CLOUDFLARE_R2_PUBLIC_ENDPOINT : YANDEX_OBJECT_STORAGE_PUBLIC_ENDPOINT


        try {
            await client.send(
                new PutObjectCommand({
                    Bucket: 'sphere-bucket',
                    Key: bucketPath,
                    // Body: fs.createReadStream(track.filepath),
                    Body: fileBuffer,
                    ContentType: 'audio/mpeg'
                })
            )


            // const uploadedTrackUrl = `${CLOUDFLARE_R2_PUBLIC_ENDPOINT}/musicLibrary/${encodeURIComponent(track.filename)}`
            const uploadedTrackUrl = `${storagePublicEndpoint}/musicLibrary/${encodeURIComponent(track.filename)}`

            // console.log(`${track.filename} is uploaded to cloudflare`)
            console.log(`${track.filename} is uploaded to ${uploadTo}`)

            return uploadedTrackUrl
        } catch (error) {
            console.log(`track: ${track.filename} wasn't uploaded`)
            console.error(error)

            return null
        }
    }

    static async uploadTrackToCloudflareR2(track: Track): Promise<string | null> {
        return this.#uploadTrackToS3({track, uploadTo: 'cloudflare'})
    }

    static async uploadTrackToYandexObjectStorage(track: Track): Promise<string | null> {
        return this.#uploadTrackToS3({track, uploadTo: 'yandex'})
    }

    static async uploadTrackCoverToCloudflareR2(cover: Cover, trackname: string): Promise<string | null> {
        try {

            const bucketPath = `covers/${trackname}-cover`
            await cloudflareS3Client.send(
                new PutObjectCommand({
                    Bucket: 'sphere-bucket',
                    Key: bucketPath,
                    Body: cover.imageBuffer,
                    ContentType: cover.mime
                })
            )

            // console.log(`\tcover is uploaded to cloudflare`)
            // console.log(`\tcover for ${trackname} is uploaded to cloudflare`)

            const filename = trackname + '.mp3'
            const spacesToIntend = filename.length - 'cover'.length

            // 'trackname.mp3'
            // '        cover is uploaded...'

            console.log(' '.repeat(spacesToIntend) + 'cover is uploaded to cloudflare')

            const url = `${CLOUDFLARE_R2_PUBLIC_ENDPOINT}/${encodeURIComponent(bucketPath)}`

            return url

        } catch (error) {

            // console.log(`track: ${track.filename} wasn't uploaded`)
            console.log(`error when uploading track's cover`)
            console.error(error)

            return null
        }
    }

    static async uploadPlaylistToAirtable(tracks: Track[]) {

        const dataToUpload = {

            records: tracks.map(track => {
                return {
                    fields: track.airtableData
                }
            })
        }

        // console.log('datat', dataToUpload.records[0].fields)
        try {

            // https://axios-http.com/docs/req_config
            const response = await axios.post(airtableUrl, dataToUpload, {
                // method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PERSONAL_ACCESS_AT_TOKEN}`,
                },
            })

            return response
        } catch(error) {
          console.log(`couldn't upload tracks to AT`)

            if (error instanceof AxiosError) {
                const response = error.response
                if (response) {
                    console.log(response.status)
                    console.log(response.statusText)
                }
            } else {
                console.log(error)
            }
        }
    }
}

