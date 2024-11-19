import type { Context } from "hono";
import path from "path";
import fs from "fs";
import { ExcelKit } from "../lib/excelKit.js";
import { createDataImport, deleteDataImport, getDataFileByUUIDOnly, getDataImport, getFileDataImport, previewDataFileByUUID } from "../models/dataImport.js";
import { getMatchData } from "../models/matchData.js";


export const excelUpload = async(ctx: Context) => {
    try {
        const body = await ctx.req.parseBody();
        const file = body.file;

        if (!file) {
            return ctx.json({message : 'file not found'});
        }

        // ambil uuid
        const uuid = ctx.get('uuid');
        if (typeof file !== 'object' || !('name' in file)) {
            return ctx.json({message: 'file tidak valid'}, 400);
        }

        const fileName = (file as File).name.toLowerCase();
         // Validasi ekstensi file
        const validExtensions = ['.xlsx', '.xls'];
        const isExcelFile = validExtensions.some((ext) => fileName.endsWith(ext));

        if (!isExcelFile) {
        return ctx.json({ message: 'File bukan Excel' }, 400);
        }

        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const fileNameNow = `upload_${Date.now()}.xlsx`;

        const filePath = path.join(process.cwd(), 'uploads', fileNameNow);
        await fs.promises.writeFile(filePath, fileBuffer);
        
        const uploader = new ExcelKit();
        // Panggil ExcelUploader untuk mengolah file
        const dataToInsert = await uploader.handleExcelUpload(fileBuffer, fileNameNow, uuid);

        await createDataImport(dataToInsert);
        await fs.promises.unlink(filePath);
        console.log(dataToInsert);
        return ctx.json({ message: 'File berhasil diupload'}); 
    } catch (error) {
        console.error('Error handling upload:', error);
        return ctx.json({ message: 'Internal server error' }, 500);
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