import type { FieldPacket, RowDataPacket } from "mysql2";
import { db } from "../utils/db.js";

export const getMatchData = async(nama?: string, dob?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT DISTINCT t1.nama as nama_data, t1.alamat as alamat_data, t1.kecamatan as kecamatan_data, t1.kelurahan as kelurahan_data, dpt_kpu.nama, dpt_kpu.kecamatan, dpt_kpu.kelurahan FROM dpt_kpu JOIN tanggal_lahir ON dpt_kpu.id = tanggal_lahir.dpt_id JOIN data_import t1 on tanggal_lahir.tanggal_lahir = t1.ttl WHERE tanggal_lahir.tanggal_lahir = ? AND dpt_kpu.nama LIKE ? GROUP BY t1.nama',
        [`${dob}`, `${nama}%`]
    );


    return rows;
}