import fs from 'fs';
import { Request, Response } from 'express';
import { errorResponse, successResponse } from './Responses';
import { uploadToR2 } from './cloudFlareR2';

interface FileUploadRequest extends Request {
    file?: Express.Multer.File;
}

const fileUpload = async (req: FileUploadRequest, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json(
            errorResponse({
                message: 'File is required',
            }),
        );
        return;
    }

    const dealId = req?.body?.dealId;

    const file = req.file;
    let key: string;
    key = `sell_app/${Date.now()}-${file.originalname}`;

    const uploadResult = await uploadToR2(file, key);

    fs.unlinkSync(file.path);

    if (uploadResult.success) {
        res.status(200).json(
            successResponse({
                message: 'file uploaded',
                data: uploadResult.url,
            }),
        );
    } else {
        res.status(500).json(
            errorResponse({
                message: 'File uploading failed',
            }),
        );
    }
};

export default fileUpload;