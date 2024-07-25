export type Cover = {
    imageBuffer: Buffer, // simplify it to string by now
    httpsCoverUrl?: string | null,
    mime: string
}

// export type PlaylistHashtag = string;
export type PlaylistHashtag = string;

export interface Track {
    duration: string,
    filename: string,
    cover?: Cover,
    filepath: string,
    trackname: string, // filename without an extension
    uploadedTrackUrl?: string,
    processedFileLocalUrl?: string,
    // folderHashTag?: string // will be required
    // folderHashTag?: string // will be required
    playlistHashTag?: string // will be required

    artistName?: string,
    // trackName?: string,
    albumName?: string,
    albumYear?: string,
}

// artist name (.artist), song name(.title), album name (.album), album year (.year)
// 3.2 поместить эти данные в поля в Airtable — Artist name, Track name, Album name, Album year


export type AirtableTrackItem = {
    image?: {
        url: string
    }[],
    // filename: string,
    trackUrl: string,
    duration: string,
    'Artist name'?: string,
    'Track name'?: string,
    'Album name'?: string,
    'Album year'?: string,
    // playlistHashTag: string
    hashtag: string // playlist hashtag (folder name)
}