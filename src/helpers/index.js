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

        return {
            filename: 'blabla',
            image: [
                {
                    url: dataURL,
                    filename: 'blabla image filename',
                    // type: 'image/jpeg'
                    type: songData.value.image.mime
                }
            ],
            duration: songData.value.duration
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

const parseMetadataFromImages = async (filePaths) => {
    const promises = filePaths.map(filepath => {
        return new Promise((resolve, reject) => {
            NodeID3.read(filepath, function(error, tags) {
                if (error) {
                    console.error(err);
                    reject(error)
                } else {
                    console.log(tags)
                    resolve(tags)
                }
            })
        })
    })

    const metadata = await Promise.allSettled(promises)
    return metadata
}

module.exports = {

    createAirtableData,
    parseMetadataFromImages
}


// module.exports.createAirtableData = () => {
//     console.log('dfs')
//
// }