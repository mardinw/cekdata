import type { Context } from "hono";
import path from "path";
import fs from "fs";
import { ExcelKit } from "../lib/excelKit.js";
import { createDataImport, deleteDataImport, getDataFileByUUIDOnly, getDataImport, getFileDataImport, previewDataFileByUUID } from "../models/dataImport.js";
import { getMatchData } from "../models/matchData.js";


export const excelUpload = async(ctx: Context) => {
    const body = await ctx.req.parseBody();
    const file = body.file;

    if (!file) {
        return ctx.json({message : 'file not found'}, 400);
    }

    // ambil uuid
    const uuid = ctx.get('uuid');
    
    if (file instanceof File) {
        // menggunakan arraybuffer
        const arraybuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arraybuffer);

        // cek apakah nama file mengandung ekstensi .xlsx atau .xls
        const fileName = file.name.toLowerCase()
        
        if(!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
            return ctx.json({message: 'file bukan excel'}, 400);
        }

        const fileNameNow = `upload_${Date.now()}.xlsx`;

        const filePath = path.join(process.cwd(), 'uploads', fileNameNow);
        await fs.promises.writeFile(filePath, fileBuffer);
        
        const uploader = new ExcelKit();

        // Panggil ExcelUploader untuk mengolah file
        const dataToInsert = await uploader.handleExcelUpload(fileBuffer, fileNameNow, uuid);
        try {
            await createDataImport(dataToInsert);
            
            // ketika berhasil import file maka dihapus
            await fs.promises.unlink(filePath);
            return ctx.json({message: 'file berhasil di upload dan data dimasukkan ke database'}, 200);
        } catch (error) {
            console.error('Error membaca atau memproses file:', error);
            return ctx.json({message: 'Gagal memproses file excel'}, 500);
        }
        
    } else {
        return ctx.json({message: 'file tidak valid'}, 400);
    }
}

export const listFileExcel = async (ctx: Context) => {
    // cek uuid yang login
    const uuid = ctx.get('uuid');
    try {
        const data = await getDataFileByUUIDOnly(uuid);
        return ctx.json(data);
    } catch (error) {
        console.error("Error:", error);
        return;
    }    
}

export const previewFileExcel = async (ctx: Context) => {
    // spesifik nama filenya
    const fileName = ctx.req.query('file');

    // cek uuid yang login
    const uuid = ctx.get('uuid');
    try {
        const data = await previewDataFileByUUID(uuid, fileName);
        return ctx.json(data);
    } catch (error) {
        console.error("Error:", error);
        return;
    }    
}

export const exportMatchToExcel = async (ctx: Context) => {
    // ambil file yang ingin di match dan export ke excel
    const file = ctx.req.query('file');

    // cek uuid yang login
    const uuid = ctx.get('uuid');

    const allMatchedData = [];

    // This is for get data from file import
    const dataImport = await getDataImport(file, uuid);

    // Condition for get piece item to match data on table dpt
    for( const item of dataImport) {
        const { nama, ttl} = item;
        const matchedData = await getMatchData(nama, ttl);
        allMatchedData.push(...matchedData);
    }

    const handler = new ExcelKit();
    try {
        const result = await handler.handleExportToExcel(allMatchedData);
        ctx.header('Content-Disposition', `attachment; filename="match_${Date.now()}.xlsx"`);
        ctx.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return ctx.body(result);
    } catch(error) {
        return ctx.json({message: error});
    }
}

export const downloadSample = async (ctx: Context) => {
    // cek uuid yang login
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    const handler = new ExcelKit();
    const fileName = 'sample.xlsx'
    try {

        const result = await handler.handleCreateSampleExcel();

        ctx.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        ctx.header('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
        return ctx.body(result);
    } catch(error) {
        console.error('Error:', error);
        return ctx.text('Error downloading file', 500);
    }
}

export const getFile = async (ctx: Context) => {
    // cek uuid yang login
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    try {
        const res = await getFileDataImport(uuid);
        return ctx.json(res);
    } catch (error) {
        console.error('Error:', error);
        return ctx.text('Error get file', 500);
    }
}

export const deleteFile = async(ctx: Context) => {
    // ambil file yang akan di delete
    const file = ctx.req.query('file');
    // ambil juga uuid untuk mengecek
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    try {
        await deleteDataImport(file);
        return ctx.json({message: "file successfully delete"});
    } catch (error) {
        console.error('Error:', error);
        return ctx.text('Error get file', 500);
    }
}