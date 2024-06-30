import {FileData, Track} from "./types";
import NodeID3, {Tags} from "node-id3";
import {Uploader} from "./Uploader.js";

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
    //
    // async getTracksHttpsUrls() {
    //     this.tracks = await Uploader.uploadCoversToDigitalOcean(this.tracks)
    //     this.tracks.forEach(console.log)
    // }

    // parseCovers() {

    // }

}
