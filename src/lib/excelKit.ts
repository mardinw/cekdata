import Exceljs from 'exceljs';
import { processDOBAndGender } from '../helpers/processDOBAndGender.js';
import path from 'path';

export class ExcelKit {
    public async handleExcelUpload(file: ArrayBuffer, fileName: string, uuid: string) {
        const workbook = new Exceljs.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.worksheets[0];
        const dataToInsert: string[][] = [];
        
        if(worksheet.rowCount > 101) {
            throw new Error("File excel memiliki lebih dari 100 baris data!");
        }
        
        worksheet.eachRow((row, rowNumber) => {
            if(rowNumber > 1) {
                const nama = row.getCell(1).text.toUpperCase();
                let dob = row.getCell(2).value;
                if(dob instanceof Date) {
                    dob = dob.toISOString().substring(0, 10);
                } else {
                    dob = dob?.toString() || '';
                }

                const gender = row.getCell(3).text.toUpperCase();
                const alamat = row.getCell(4).text.toUpperCase();
                const kecamatan = row.getCell(5).text.toUpperCase();
                const kelurahan = row.getCell(6).text.toUpperCase();
                
                const ttl = processDOBAndGender(dob, gender);

                dataToInsert.push([nama, dob, gender, alamat, kecamatan, kelurahan, ttl, fileName, uuid]);
            }
        });

        return dataToInsert;
    }

    public async handleExportToExcel(allMatchedData: any[]) {
        const workbook = new Exceljs.Workbook()
        // create sheet
        const worksheet = workbook.addWorksheet("Match Data");

        // Menambahkan header kolom
        worksheet.columns = [
            {header: 'Nama Data', key: 'nama_data', width: 20 },
            {header: 'Alamat Data', key: 'alamat_data', width: 20 },
            { header: 'Kelurahan Data', key: 'kelurahan_data', width: 20 },
            { header: 'Kecamatan Data', key: 'kecamatan_data', width: 20 },
            { header: 'Nama Match', key: 'nama', width: 20 },
            { header: 'Kelurahan Match', key: 'kelurahan', width: 20 },
            { header: 'Kecamatan Match', key: 'kecamatan', width: 20 },
        ];

        // memassukan data array ke worksheet
        allMatchedData.forEach((data) => {
            worksheet.addRow(data);
        });

        // konversi workbook ke buffer
        const buffer = await workbook.xlsx.writeBuffer();

        return buffer;
    }

    public async handleCreateSampleExcel() {
        const workbook = new Exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Menambahkan kolom header
        worksheet.columns = [
            { header: 'nama', key: 'nama', width: 30 },
            { header: 'dob', key: 'dob', width: 30 },
            { header: 'gender', key: 'gender', width: 10 },
            { header: 'alamat', key: 'alamat', width: 10 },
            { header: 'kelurahan', key: 'kelurahan', width: 30 },
            { header: 'kecamatan', key: 'kecamatan', width: 30 },
        ];

        // Menambahkan data
        worksheet.addRow({ 
            nama: 'mardin', 
            dob: '1991-01-17', 
            gender: 'L',
            alamat: 'Jl. Lemah Hegar no. 99', 
            kelurahan: 'sukapura',
            kecamatan: 'kiaracondong',
        });

        const buffer = await workbook.xlsx.writeBuffer();
        console.log('File sample.xlsx created.');
        return buffer;
    }
}