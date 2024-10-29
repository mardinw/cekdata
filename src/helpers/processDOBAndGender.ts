import type { DataImport } from "../dtos/dataImport.js";

export const processDOBAndGender = (data: DataImport[]) => {
    return data.map(item => {
        let processDOB = item.dob;

        // check if gender is "P"
        if (item.gender === "P") {
            const dayPart = parseInt(item.dob.slice(0,2)) + 40;
            processDOB = `${dayPart.toString().padStart(2, '0')}${item.dob.slice(2)}`;
        } 

        return {
            ...item,
            dob: processDOB
        };
    });
}