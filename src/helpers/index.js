const NodeID3 = require("node-id3");
require('dotenv').config();

const {
    PERSONAL_ACCESS_TOKEN,
    BASE_ID,
    FIRST_TABLE_ID
} = process.env

const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${FIRST_TABLE_ID}`

const createAirtableData = (playlistMetaData) => {
    const data = playlistMetaData.map(songData => {
        const buffer = songData.value.image.imageBuffer
        const convertedToBase64 = buffer.toString('base64')
        const dataURL = `data:application/octet-stream;base64,${convertedToBase64}`
        const duration = `${Math.round(songData.value.length / 1000)}`

        return {
            fields: {
                // filename: 'blabla12',
                filename: songData.value.filename,
                // image: [
                //     {
                //         // url: dataURL,
                //         // url: 'https://midnight-runner.vercel.app/images/arv.ean-photo1.jpeg',
                //         // filename: 'blabla image filename',
                //         // type: 'image/jpeg'
                //         // type: songData.value.image.mime
                //     }
                // ],
                duration
            }
        }
        // console.log('converted', converted)
        // console.log('dataURL', `data:application/octet-stream;base64,${converted}`)
    })

    const airtableData = {
        records: data
    }

    return airtableData
}




const uploadPlaylistDataToAirtable = async (dataToUpload) => {
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

const parseMetadataFromImages = async (fileData) => {
    const promises = fileData.map(data => {
        return new Promise((resolve, reject) => {
            NodeID3.read(data.filepath, function(error, tags) {
                if (error) {
                    console.error(err);
                    reject(error)
                } else {
                    // console.log(tags)

                    resolve({...tags, filename: data.filename})
                }
            })
        })
    })

    const metadata = await Promise.allSettled(promises)
    return metadata
}

module.exports = {

    createAirtableData,
    parseMetadataFromImages,
    uploadPlaylistDataToAirtable
}


// module.exports.createAirtableData = () => {
//     console.log('dfs')
//
// }