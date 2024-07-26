export type Cover = {
    imageBuffer: Buffer, // simplify it to string by now
    httpsCoverUrl?: string | null,
    mime: string
}

// export type PlaylistHashtag = string;
// export type PlaylistHashtag = string;



export interface Track {
    duration: string,
    filename: string,
    cover?: Cover,
    filepath: string,
    trackname: string, // filename without an extension
    // uploadedTrackUrl?: string,
    processedFileLocalUrl?: string,
    processedFileDuration?: string,

    airtableData: AirtableData
}

export interface AirtableData {
    'artist name'?: string,
    'track name'?: string,
    'album name'?: string,
    'album year'?: string,
    // playlistHashTag: string
    hashtag: string, // playlist hashtag (folder name)
    image?: {
        url: string
    }[], // image property is an array of objects
    trackUrl?: string,
    duration?: string // added after file processing
    // uploadedTrackUrl: string
}
