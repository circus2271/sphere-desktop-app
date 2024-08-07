import {AirtableTrackItem, Cover, Track} from "./types";
import {airtableUrl, CLOUDFLARE_R2_PUBLIC_ENDPOINT, PERSONAL_ACCESS_TOKEN, S3} from "./helpers";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import fs from "fs";
import axios, {AxiosError} from "axios";

export class Uploader {

    static async uploadTrackToCloudflareR2(track: Track): Promise<string | null> {
        try {
            await S3.send(
                new PutObjectCommand({
                    Bucket: 'sphere-bucket',
                    Key: track.filename,
                    // Body: fs.createReadStream(track.filepath),
                    Body: fs.createReadStream(track.processedFileLocalUrl as string),
                    ContentType: 'audio/mpeg'
                })
            )

            const uploadedTrackUrl = `${CLOUDFLARE_R2_PUBLIC_ENDPOINT}/${encodeURI(track.filename)}`

            console.log(`${track.filename} is uploaded to cloudflare`)

            return uploadedTrackUrl
        } catch (error) {
            console.log(`track: ${track.filename} wasn't uploaded`)
            console.error(error)

            return null
        }
    }

    static async uploadTrackCoverToCloudflareR2(cover: Cover, trackname: string): Promise<string | null> {
        try {

            const bucketPath = `covers/${trackname}-cover`
            await S3.send(
                new PutObjectCommand({
                    Bucket: 'sphere-bucket',
                    Key: bucketPath,
                    Body: cover.imageBuffer,
                    ContentType: cover.mime
                })
            )

            console.log(`cover is also uploaded to cloudflare`)
            const url = `${CLOUDFLARE_R2_PUBLIC_ENDPOINT}/${encodeURI(bucketPath)}`

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

        console.log('datat', dataToUpload.records[0].fields)
        try {

            // https://axios-http.com/docs/req_config
            const response = await axios.post(airtableUrl, dataToUpload, {
                // method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PERSONAL_ACCESS_TOKEN}`,
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

            // return null
        }
    }
}

