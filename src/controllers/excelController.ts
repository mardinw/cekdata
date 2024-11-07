import type { Context } from "hono";
import path from "path";
import fs from "fs";
import { ExcelKit } from "../lib/excelKit.js";
import { createDataImport } from "../models/dataImport.js";


export const excelUpload = async(c: Context) => {
    const body = await c.req.parseBody();
    const file = body.file;

    if (!file) {
        return c.json({message : 'file not found'}, 400);
    }

    // ambil uuid
    const uuid = c.get('uuid');
    
    if (file instanceof File) {
        // menggunakan arraybuffer
        const arraybuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arraybuffer);

        // cek apakah nama file mengandung ekstensi .xlsx atau .xls
        const fileName = file.name.toLowerCase()
        
        if(!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            return c.json({message: 'file bukan excel'}, 400);
        }

        const fileNameNow = `upload_${Date.now()}.xlsx`;

        const filePath = path.join(process.cwd(), 'uploads', fileNameNow);
        await fs.promises.writeFile(filePath, fileBuffer);
        
        const uploader = new ExcelKit();

        // Panggil ExcelUploader untuk mengolah file
        const dataToInsert = await uploader.handleExcelUpload(fileBuffer, fileNameNow, uuid);
        try {
            await createDataImport(dataToInsert);
            await fs.promises.unlink(filePath);
            return c.json({message: 'file berhasil di upload dan data dimasukkan ke database'}, 200);
        } catch (error) {
            console.error('Error membaca atau memproses file:', error);
            return c.json({message: 'Gagal memproses file excel'}, 500);
        }
        
    } else {
        return c.json({message: 'file tidak valid'}, 400);
    }
}