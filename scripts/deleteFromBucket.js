import 'dotenv/config'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';


export const {
    ACCESS_KEY_ID,
    SECRET_ACCESS_KEY,
    ACCOUNT_ID,
} = process.env


export const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

const deleteFileFromBucket = async (trackName) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: 'sphere-bucket',
            Key: `musicLibrary/${trackName}`,
        });
        await S3.send(command);
        console.log(`Successfully deleted ${trackName} from ${'sphere-bucket'}`);
    } catch (error) {
        console.error(`Error deleting ${trackName}:`, error);
    }
};



const trackNamesToDelete = [
    // 'trackname1.mp3',
    // 'trackname2.mp3',
    // ... and so on
]


for await (const trackName of trackNamesToDelete) {
    await deleteFileFromBucket(trackName);
}