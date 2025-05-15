import {Track} from "./types";


class YandexMirrorStore {
    private mirroredTracks: Track[] = []

    get mirroredTracksAmount() {
        return this.mirroredTracks.length
    }

    addNewAlreadyMirroredTracks(tracks: Track[]) {
        this.mirroredTracks.push(...tracks)
    }

}

export class Playlist {
    private tracks: Track[] = []
    private uploadedTracks: Track[] = []
    uniqueTrackFilenames: string[] = []
    yandexMirrorStore = new YandexMirrorStore()

    addMultipleUploadedTracks(tracks: Track[]) {
        this.uploadedTracks.push(...tracks)
    }

    addSingleUploadedTrack(track: Track) {
        this.uploadedTracks.push(track)
    }

    getUploadedTracks(): Track[] {
        return this.uploadedTracks
    }

    get uploadedTracksAmount() {
        return this.uploadedTracks.length
    }

    get tracksAmount() {
        return this.tracks.length
    }

    // addSingleTrack(tracks: Track) {
    //     this.tracks.push(tracks)
    // }

    addTracks(tracks: Track[]) {
        this.tracks.push(...tracks)
    }

    getTracks() {
        return this.tracks
    }

    deleteLocalPlaylist() {
        this.tracks = []
    }

    deleteUploadedTracksInfo() {
        this.uploadedTracks = []
    }
}
