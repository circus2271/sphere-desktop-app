import NodeID3, {Tags} from "node-id3";

type Cover = {
    // blobCover: Blob,
    blobCover: string, // simplify it to string by now
    httpsCoverUrl?: string
}
// } | null


type FileData = {
    filename: string;
    filepath: string;
}[]

// type FIleDataArray = File
interface Track {
    // filename:
    duration: number,
    filename: string,
    cover?: Cover,
    // getTrackHttpsUrl(): any, // probably use Uploader class

}

export class Playlist {
    private tracks: Track[] = []

    addTracks(tracks: Track[]) {
        this.tracks.push(...tracks)
    }

    async parseMetaData(fileData: FileData) {
        const promises = fileData.map(data => {
            return new Promise((resolve, reject) => {
                NodeID3.read(data.filepath, function(error: any, tags: Tags) {
                    if (error) {
                        // console.error('err');
                        reject(error)
                    } else {
                        // console.log(tags)

                        // tags
                        console.log('originalFilename', tags.originalFilename)
                        resolve({...tags, filename: data.filename})
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

class Uploader {
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
    },
    {
        duration: 221,
        filename: 'track2.mp3',
        cover: {
            blobCover: 'fdsfsdf'
        }
    },
    {
        duration: 225,
        filename: 'track3.mp3',
        cover: undefined
    },
    {
        duration: 231,
        filename: 'track4.mp3',
        cover: {
            blobCover: 'fdfsdf fake blob data'
        }
    },
]

