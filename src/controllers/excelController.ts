import type { Context } from "hono";
import path from "path";
import fs from "fs";
import fileType from 'file-type'; 
import { ExcelKit } from "../lib/excelKit.js";

export const excelUpload = async(c: Context) => {
    const body = await c.req.parseBody();
    const file = body.file;

    console.log(file);
    if (!file) {
        return c.json({message : 'file not found'}, 400);
    }

    if (file && typeof file !== 'string' && 'buffer' in file) {
        // Cek tipe MIME file
        const fileBuffer = file.buffer;
        const { mime } = await fileType.fromBuffer(fileBuffer) || {};
        if (mime !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && mime !== 'application/vnd.ms-excel') {
            return c.json({ message: 'File bukan file Excel' }, 400);
        }

        const filePath = path.join(__dirname, 'uploads', file.name);
        await fs.promises.writeFile(filePath, fileBuffer);

        const uploader = new ExcelKit();

        // Panggil ExcelUploader untuk mengolah file
        await uploader.handleExcelUpload(file.buffer);

        // Hapus file setelah selesai diproses
        await fs.promises.unlink(filePath);

        return c.json({ message: 'File berhasil di-upload dan data dimasukkan ke database' }, 200);
    } else {
        return c.json({message: 'file tidak valid'}, 400);
    }
}