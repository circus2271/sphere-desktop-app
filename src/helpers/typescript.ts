import NodeID3, {Tags} from "node-id3";
import {S3} from './helpers'


import {
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteBucketCommand,
    paginateListObjectsV2,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";

export type Cover = {
    // blobCover: Blob,
    blobCover: string, // simplify it to string by now
    httpsCoverUrl?: string
}
// } | null


export type FileData = {
    filename: string;
    filepath: string;
}[]

// type FIleDataArray = File
export interface Track {
    // filename:
    duration: number,
    filename: string,
    cover?: Cover,
    filepath: string
    // getTrackHttpsUrl(): any, // probably use Uploader class

}

export class Playlist {
    private tracks: Track[] = []

    get tracksAmount() {
        return this.tracks.length
    }

    addSingleTrack(tracks: Track) {
        this.tracks.push(tracks)
    }

    addTracks(tracks: Track[]) {
        this.tracks.push(...tracks)
    }

    getTracks() {
        return this.tracks
    }

    async parseMetaData(fileData: FileData) {
        const promises = fileData.map(data => {
            return new Promise((resolve, reject) => {
                NodeID3.read(data.filepath, function(error: any, tags: Tags) {
                    if (error) {
                        reject(error)
                    } else {
                        // tags
                        console.log('originalFilename', tags.originalFilename)
                        resolve({...tags, filename: data.filename, filepath: data.filepath})
                    }
                })
            })
        })

        const metadata = await Promise.allSettled(promises)
        return metadata
    }

    async getTracksHttpsUrls() {
        this.tracks = await Uploader.uploadCoversToDigitalOcean(this.tracks)
        this.tracks.forEach(console.log)
    }

    // parseCovers() {

    // }

}

// const airtableApiEndpoint = 'https:/v0.airtable.com'
const BASE_ID = 'fake id'
const TABLE_ID = 'fake id'
const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`

export class Uploader {

    static async uploadTracksToCloudflareR2(tracks: Track[]) {
        // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html

        for await (const track of tracks) {
            try {
                console.log('trying to send a file')
                await S3.send(
                    new PutObjectCommand({
                        Bucket: 'sphere-bucket',
                        // Key: "my-first-object.txt",
                        // Body: "Hello JavaScript SDK!",
                        Key: track.filename,
                        // Body: "Hello JavaScript SDK!",
                        // chat gpt help
                        Body: fs.createReadStream(track.filepath),
                        ContentType: 'audio/mpeg'
                    })
                )

                console.log('file sended')
            } catch(err) {
                console.log('error.. could not send a file')
            }

        }

    }

    static async uploadTracksToDigitalOcean(tracks: Track[]) {

        const response = await fetch(airtableUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tracks)
        })

        if (response.ok) {
            console.log('files are uploaded')
        }

    }

    static async uploadCoversToDigitalOcean(tracks: Track[]): Promise<Track[]> {
        // get cover blob and upload it to digital ocean
        // get url of uploaded cover

        for await (const track of tracks) {
            // probably will be memory expensive as cover may wight .5 mb
            if (!track.cover) continue
            // if (!track.hasOwn('cover')) continue

            const response = await fetch('https://digitalocean.com/test-url', {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'application/json',
                    'Content-Type': 'application/octet-stream',
                    body: track.cover.blobCover
                }
            })

            if (response.ok) {
                // track.cover.httpsCoverUrl = response.text//uploadedImageUrl


                // delete track.cover.blobCover
            }
        }

        return tracks
    }

    uploadPlaylistToAirtable() {
        // split all tracks for chunks by 10 to bypass airtable's api limit
        // simplify it by now

    }
}

const tracks: Track[] = [
    {
        duration: 227,
        filename: 'track1.mp3',
        filepath: 'fake-path/track1.mp3'
    },
    {
        duration: 221,
        filename: 'track2.mp3',
        cover: {
            blobCover: 'fdsfsdf'
        },
        filepath: 'fake-path/track2.mp3'
    },
    {
        duration: 225,
        filename: 'track3.mp3',
        cover: undefined,
        filepath: 'fake-path/track3.mp3'
    },
    {
        duration: 231,
        filename: 'track4.mp3',
        cover: {
            blobCover: 'fdfsdf fake blob data'
        },
        filepath: 'fake-path/track4.mp3'
    },
]

