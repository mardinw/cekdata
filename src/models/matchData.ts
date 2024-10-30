import type { FieldPacket, RowDataPacket } from "mysql2";
import { db } from "../utils/db.js";

export const getMatchData = async(nama?: string, dob?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT t1.nama AS nama_data, t1.kecamatan AS kecamatan_data, t1.kelurahan AS kelurahan_data, t2.nama AS nama_match, t2.kecamatan AS kecamatan_match, t2.kelurahan AS kelurahan_match FROM data_import t1 JOIN dpt_kpu t2 ON t2.nama LIKE CONCAT(?) AND t2.nik LIKE CONCAT(?) WHERE t1.nama LIKE ?', 
        [`${nama}%`, `%${dob}%`, `${nama}%`]);

    return rows;
}