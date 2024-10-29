import { db } from "../utils/db.js";

export const getMatchData = async(nama?: string, dob?: string) => {
    const [rows] = await db.query(
        'SELECT t1.nama, t1.kecamatan, t1.kelurahan, t2.nama, t2.kecamatan, t2.kelurahan FROM data_import t1 JOIN dpt_kpu t2 ON t2.nama LIKE CONCAT(?) AND t2.nik LIKE CONCAT(?)', 
        [`${nama}%`, `%${dob}%`]);
    return rows;
}