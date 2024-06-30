export type Cover = {
    imageBuffer: Buffer, // simplify it to string by now
    httpsCoverUrl?: string | null,
    mime: string
}
// } | null


export type FileData = {
    filename: string;
    filepath: string;
}[]

// type FIleDataArray = File
export interface Track {
    // filename:
    // duration: number,
    duration: string,
    filename: string,
    // cover?: Cover,
    cover?: Cover,
    filepath: string,
    trackname: string, // filename without an extension
    uploadedTrackUrl?: string
}

export type AirtableTrackItem = {
    image?: {
        url: string
    }[],
    filename: string,
    trackUrl: string,
    duration: string,
}