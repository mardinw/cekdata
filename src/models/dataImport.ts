import type { RowDataPacket } from "mysql2";
import { db } from "../utils/db.js"
import type { DataImport } from "../dtos/dataImport.js";


export const getDataImport = async (file?: string, users?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM data_import WHERE file = ? AND users = ?',
        [file, users]
    );

    
    const data: DataImport[] = rows.map(row => ({
        id: row.id,
        nama: row.nama,
        ttl: row.ttl,
        kecamatan: row.kecamatan,
        kelurahan: row.kelurahan,
        file: row.file,
        users: row.users,
        gender: row.gender
    }))

    return data;
}

export const getDataFileByUUIDOnly = async( uuid: string) => {
    const query = 'SELECT count(file) as jumlah_data, file as nama_file, users FROM data_import WHERE users = ?';
    const [result] = await db.query(query, [uuid])
    return result;
}

export const previewDataFileByUUID = async( uuid: string, fileName?: string) => {
    const query = 'SELECT nama, dob, kecamatan, kelurahan, file FROM data_import where users = ? AND file = ?';
    const [result] = await db.query(query, [uuid, fileName]);
    return result;
}

export const createDataImport = async(dataToInsert: string[][]) => {
    const query = 'INSERT INTO data_import(nama, dob, gender, kecamatan, kelurahan, ttl, file, users) VALUES ?';
    const [result] = await db.query(query, [dataToInsert])
    return result;
}

export const updateDataImport = async(
    filter?: {
        nama?: string,
        dob?: string,
        kecamatan?: string,
        kelurahan?: string,
    },
    file?: string,
    users?: string
) => {
    let query = 'UPDATE data_import';
    let params: string[] = [];

    if(filter) {
        const conditions: string[] = [];

        if(filter.nama) {
            conditions.push('nama = ?');
            params.push(filter.nama);
        }

        if(filter.dob) {
            conditions.push('dob = ?');
            params.push(filter.dob);
        }

        if(filter.kecamatan) {
            conditions.push('kecamatan = ?');
            params.push(filter.kecamatan);
        }

        if(filter.kelurahan) {
            conditions.push('kelurahan = ?');
            params.push(filter.kelurahan);
        }

        if(conditions.length > 0) {
            query += ' SET ' + conditions.join(', ');
        }
    }

    const [rows] = await db.query(query, params);
    return rows;
}

export const deleteDataImport = async(file: string) => {
    const query = 'DELETE FROM data_import WHERE file = ?';
    const [result] = await db.query(query, [file]);
    return result;
}