// require('dotenv').config();
import {Tags} from 'node-id3'
// import {Track} from './typescript';
import 'dotenv/config'
import { Track } from './typescript';

const {
    PERSONAL_ACCESS_TOKEN,
    BASE_ID,
    FIRST_TABLE_ID
} = process.env

export const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${FIRST_TABLE_ID}`

type AirtableTrackItem = {
    filename: string,
    image?: {
        url: string
    },
    duration: number
}


export const splitDataIntoChunks = (data: []) => {
    // split data into chunks to bypass airtabble api limit
    // (send no more then 10 items per request)
    const chunks = [] // array of arrays

    for (let i = 0; i < data.length; i+=10) {
        // 0, 10
        // 10, 20
        // 30, 40
        const portion = data.slice(i, i +10)
        chunks.push(portion)
    }

    return chunks
}

// export const createAirtableData = (playlistMetaData) => {
export const getTracksData = (playlistMetaData): Track[] => {
// https://stackoverflow.com/a/41385149/9675926
    const data = playlistMetaData.map((songData) => {
        const buffer = songData.value.image.imageBuffer
        const convertedToBase64 = buffer.toString('base64')
        const dataURL = `data:application/octet-stream;base64,${convertedToBase64}`
        const duration = `${Math.round(songData.value.length / 1000)}`

        return {
            // fields: {
                // filename: 'blabla12',
                filename: songData.value.filename,
                image: [
                    {
                        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg=='
                        // url: dataURL,
                        // url: 'https://midnight-runner.vercel.app/images/arv.ean-photo1.jpeg',
                        // filename: 'blabla image filename',
                        // type: 'image/jpeg'
                        // type: songData.value.image.mime
                    }
                ],
                duration
            }
        // }
        // console.log('converted', converted)
        // console.log('dataURL', `data:application/octet-stream;base64,${converted}`)
    })

    // const airtableData = {
    //     records: data
    // }
    //
    return data
    // return airtableData
}
// export const createAirtableData = (playlistMetaData) => {
// https://stackoverflow.com/a/41385149/9675926
//     const data = playlistMetaData.map((songData: Tags & {filename: string}) => {
//         const buffer = songData.value.image.imageBuffer
//         const convertedToBase64 = buffer.toString('base64')
//         const dataURL = `data:application/octet-stream;base64,${convertedToBase64}`
//         const duration = `${Math.round(songData.value.length / 1000)}`
//
//         return {
//             fields: {
//                 // filename: 'blabla12',
//                 filename: songData.value.filename,
//                 image: [
//                     {
//                         url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg=='
//                         // url: dataURL,
//                         // url: 'https://midnight-runner.vercel.app/images/arv.ean-photo1.jpeg',
//                         // filename: 'blabla image filename',
//                         // type: 'image/jpeg'
//                         // type: songData.value.image.mime
//                     }
//                 ],
//                 duration
//             }
//         }
//         // console.log('converted', converted)
//         // console.log('dataURL', `data:application/octet-stream;base64,${converted}`)
//     })
//
//     const airtableData = {
//         records: data
//     }
//
//     return airtableData
// }




export const uploadPlaylistDataToAirtable = async (dataToUpload: AirtableTrackItem[]) => {
    const response = await fetch(airtableUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERSONAL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(dataToUpload)
    })

    return response
}

// export const parseMetadataFromImages = async (fileData) => {
//     const promises = fileData.map(data => {
//         return new Promise((resolve, reject) => {
//             NodeID3.read(data.filepath, function(error, tags) {
//                 if (error) {
//                     console.error(err);
//                     reject(error)
//                 } else {
//                     // console.log(tags)
//
//                     resolve({...tags, filename: data.filename})
//                 }
//             })
//         })
//     })
//
//     const metadata = await Promise.allSettled(promises)
//     return metadata
// }
//
// module.exports = {
//
//     createAirtableData,
//     parseMetadataFromImages,
//     uploadPlaylistDataToAirtable
// }
//

// module.exports.createAirtableData = () => {
//     console.log('dfs')
//
// }