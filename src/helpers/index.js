// const createAirtableData = (playlistMetaData) => {
//     const data = playlistMetaData.map(songData => {
//         const buffer = songData.value.image.imageBuffer
//         const converted = buffer.toString('base64')
//         const dataURL = `data:application/octet-stream;base64,${converted}`
//
//         return {
//             filename: 'blabla',
//             image: [
//                 {
//                     url: dataURL,
//                     filename: 'blabla image filename',
//                     // type: 'image/jpeg'
//                     type: songData.value.image.mime
//                 }
//             ],
//             duration: songData.value.duration
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

// function createAirtableData () {
//     console.log('dfs')
//
// }
// module.exports
//     createAirtableData
// }

module.exports.createAirtableData = () => {
    console.log('dfs')

}