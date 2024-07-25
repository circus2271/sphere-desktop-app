// const fs = require('fs');
// const path = require('path');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');
// const ffprobePath = require('ffprobe-static').path;
// const async = require('async');
//
// ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath);
//
// const processFiles = (inputFiles, outputPath) => {
//     const startTime = Date.now();
//
//     console.log(`Found ${inputFiles.length} files in the input.`);
//
//     const mp3Files = inputFiles.filter(file => file.endsWith('.mp3'));
//     console.log(`Found ${mp3Files.length} mp3 files in the input.`);
//
//     const queue = async.queue((file, callback) => {
//         processFile(file, outputPath, callback);
//     }, 5);
//
//     queue.push(mp3Files, (err) => {
//         if (err) {
//             console.error(`Error processing file: ${err}`);
//         }
//     });
//
//     queue.drain = function() {
//         console.log('All files have been processed.');
//         const endTime = Date.now();
//         const duration = (endTime - startTime) / 1000;
//         console.log(`Total processing time: ${duration} seconds`);
//     };
// };
//
// const processFile = (inputFile, outputPath, callback) => {
//     const outputFile = path.join(outputPath, path.basename(inputFile));
//
//     console.log(`Input file: ${inputFile}`);
//     console.log(`Output file: ${outputFile}`);
//
//     ffmpeg.ffprobe(inputFile, (err, metadata) => {
//         if (err) {
//             console.error(`Error getting metadata for file ${inputFile}:`, err);
//             callback(err);
//             return;
//         }
//
//         const duration = metadata.format.duration;
//         console.log(`Duration of ${inputFile}: ${duration} seconds`);
//
//         const bitrate = metadata.format.bit_rate ? parseInt(metadata.format.bit_rate, 10) : 320000;
//         const bitrateKbps = Math.round(bitrate / 1000) + 'k';
//
//         ffmpeg(inputFile)
//             .audioFilters([
//                 'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-35dB:detection=peak',
//                 'afade=t=in:ss=0:d=0.3:curve=log:silence=0.4',
//                 'areverse',
//                 'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-35dB:detection=peak',
//                 'afade=t=in:ss=0:d=0.8:curve=qsin:silence=0.2',
//                 'areverse'
//             ])
//             .audioCodec('libmp3lame')
//             .audioBitrate(bitrateKbps)
//             .on('start', (commandLine) => {
//                 console.log(`Spawned FFmpeg with command: ${commandLine}`);
//             })
//             .on('progress', (progress) => {
//                 if (progress && progress.percent !== undefined) {
//                     console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
//                 }
//             })
//             .on('end', () => {
//                 console.log(`Successfully processed file: ${outputFile}`);
//                 callback();
//             })
//             .on('error', (err) => {
//                 console.error(`Error processing file ${inputFile}:`, err);
//                 callback(err);
//             })
//             .save(outputFile);
//     });
// };
//
// module.exports = { processFiles };
