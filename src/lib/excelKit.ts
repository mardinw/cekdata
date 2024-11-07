import Exceljs from 'exceljs';
import { processDOBAndGender } from '../helpers/processDOBAndGender.js';

export class ExcelKit {
    public async handleExcelUpload(file: ArrayBuffer, fileName: string, uuid: string) {
        const workbook = new Exceljs.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.worksheets[0];
        const dataToInsert: string[][] = [];
        
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
                const kecamatan = row.getCell(4).text.toUpperCase();
                const kelurahan = row.getCell(5).text.toUpperCase();
                
                const ttl = processDOBAndGender(dob, gender);

                dataToInsert.push([nama, dob, gender, kecamatan, kelurahan, ttl, fileName, uuid]);
            }
        });

        return dataToInsert;
    }
}