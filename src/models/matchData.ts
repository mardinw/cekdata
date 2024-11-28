import type { FieldPacket, RowDataPacket } from "mysql2";
import { db } from "../utils/db.js";

export const getMatchData = async(nama?: string, dob?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT 
        t1.nama AS nama_data, 
        t1.alamat AS alamat_data, 
        t1.kelurahan AS kelurahan_data, 
        t1.kecamatan AS kecamatan_data, 
        dpt_kpu.nama, 
        dpt_kpu.kelurahan,
        dpt_kpu.kecamatan
        FROM 
            dpt_kpu
        JOIN 
            (SELECT dpt_id, tanggal_lahir FROM tanggal_lahir WHERE tanggal_lahir = ?) AS filtered_tanggal_lahir
            ON dpt_kpu.id = filtered_tanggal_lahir.dpt_id
        LEFT JOIN 
            data_import t1 
            ON filtered_tanggal_lahir.tanggal_lahir = t1.ttl
            AND dpt_kpu.nama = t1.nama
        WHERE
            dpt_kpu.nama LIKE ?
        GROUP BY 
        t1.nama`,
    [`${dob}`, `${nama}%`]
    )

    return rows;
}