import Exceljs from 'exceljs';

export class ExcelKit {
    public async handleExcelUpload(file: any): Promise<void> {
        const workbook = new Exceljs.Workbook();
        const readFile = await workbook.xlsx.readFile(file);
        console.log(readFile);
    }
}