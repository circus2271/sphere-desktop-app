import yandexTracks from '../yandex-mirror-tracks.json' assert { type: 'json' }
import cloudflareTracks from '../cloudflare-tracks.json' assert { type: 'json' }
import fs from "fs";


const uniqueTracks = []

cloudflareTracks.forEach(t => {
    if (!yandexTracks.includes(t)) uniqueTracks.push(t)
})


fs.writeFileSync(`diff-tracks.json`, JSON.stringify(uniqueTracks), 'utf8')//, (err) => {
