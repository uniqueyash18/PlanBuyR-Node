// r2Upload.js
import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { Express } from 'express';

dotenv.config();

if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('Missing required R2 environment variables');
}

const s3 = new S3Client({
    region: 'auto', // Required for R2
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

interface UploadResult {
    success: boolean;
    key?: string;
    result?: any;
    url?: string;
    error?: any;
}

export async function uploadToR2(file: Express.Multer.File, key: string): Promise<UploadResult> {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        const result = await s3.send(command);
        return {
            success: true,
            key,
            result,
            url: `${process.env.R2_BASE_URL}/${key}`,
        };
    } catch (err) {
        console.error('Upload failed:', err);
        return { success: false, error: err };
    }
}

interface DeleteResult {
    success: boolean;
    error?: any;
}

export async function deleteFromR2(key: string): Promise<DeleteResult> {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });

    try {
        await s3.send(command);
        return { success: true };
    } catch (err) {
        console.error('Delete failed:', err);
        return { success: false, error: err };
    }
}
