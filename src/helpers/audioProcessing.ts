// const fs = require('fs');
// const path = require('path');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');
// const ffprobePath = require('ffprobe-static').path;
// const async = require('async');

// import fs from  'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import {path as ffprobePath} from 'ffprobe-static';
import async from 'async';
import {Track} from "./types";
import {audioProcessingOutputFolder, getTrackDuration} from "./helpers";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// outputPath -- папка для складывания туда файлов
// находится где-то в проекте
export const processFiles = (mp3Files: Track[], outputPath: string): Promise<Track[]> => {
// export const processFiles = (mp3Files: Track[]) => {
    // const mp3Files = inputFiles.filter(file => file.endsWith('.mp3'));

    // const processedFiles: Track[] = []
    const queue = async.queue((track: Track, callback) => {
        // processFile(track, outputPath, callback);
        const trackUrl = track.filepath // local url
        const trackName = track.filename
        const outputFile = path.join(outputPath, path.basename(trackUrl));

        console.log(`Input file: ${trackUrl}`);
        console.log(`Output file: ${outputFile}`);


        ffmpeg.ffprobe(trackUrl, (err, metadata) => {
            if (err) {
                console.error(`Error getting metadata for file ${trackUrl}:`, err);
                callback(err);
                return;
            }

            const duration = metadata.format.duration;
            // const duration = track.duration
            console.log(`Duration of ${trackUrl}: ${duration} seconds`);

            const bitrate = metadata.format.bit_rate ? parseInt(metadata.format.bit_rate, 10) : 320000;
            const bitrateKbps = Math.round(bitrate / 1000) + 'k';

            ffmpeg(trackUrl)
                .audioFilters([
                    'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-35dB:detection=peak',
                    'afade=t=in:ss=0:d=0.3:curve=log:silence=0.4',
                    'areverse',
                    'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-35dB:detection=peak',
                    'afade=t=in:ss=0:d=0.8:curve=qsin:silence=0.2',
                    'areverse'
                ])
                .audioCodec('libmp3lame')
                .audioBitrate(bitrateKbps)
                .on('start', (commandLine) => {
                    console.log(`Spawned FFmpeg with command: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    if (progress && progress.percent !== undefined) {
                        console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
                    }
                })
                // this happens after file is processed and saved (without errors)
                .on('end', async () => {
                    console.log(`Successfully processed file: ${outputFile}`);

                    // const modifiedTrackLocalUrl = path.resolve(audioProcessingOutputFolder, trackName)
                    // track.processedFileLocalUrl = modifiedTrackLocalUrl
                    track.processedFileLocalUrl = path.resolve(audioProcessingOutputFolder, trackName)
                    track.processedFileDuration = await getTrackDuration(track.processedFileLocalUrl)
                    callback();
                })
                .on('error', (err) => {
                    console.error(`Error processing file ${trackUrl}:`, err);
                    callback(err);
                })
                .save(outputFile);
        });
    }, 5);


    // start processing items.
    // no error handling here, because this is done in ffmpeg "code chain" above
    queue.push(mp3Files)


    // return a promise
    // promise will contain data with processedTracks urls
    // this data will be used in main.ts file to upload tracks to Cloudflare and AT
    return new Promise(resolve => {
        // all items are processed (with or without an error)
        queue.drain(() => {
            console.log('All files have been processed.');

            // check if some files weren't processed
            const processedFiles = mp3Files.filter(track => track.processedFileLocalUrl !== undefined)
            console.log(`${processedFiles.length} files are processed without an error`)
            console.log(`${mp3Files.length - processedFiles.length} files are not processed due to an error`)

            resolve(processedFiles)
        })
    })

};
