import type { RowDataPacket } from "mysql2";
import { db } from "../utils/db.js"
import { formatDate } from "../helpers/formatDate.js";
import { processDOBAndGender } from "../helpers/processDOBAndGender.js";
import type { DataImport } from "../dtos/dataImport.js";

export const getDataImport = async (file?: string, users?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM data_import WHERE file = ? AND users = ?',
        [file, users]
    );

    const data: DataImport[] = rows.map(row => ({
        id: row.id,
        nama: row.nama,
        dob: formatDate(row.dob),
        kecamatan: row.kecamatan,
        kelurahan: row.kelurahan,
        file: row.file,
        users: row.users,
        gender: row.gender
    }))

    return processDOBAndGender(data);
}

export const getDataNamaAndDob = async (file?: string, users?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM data_import WHERE file = ? AND users = ?',
        [file, users]
    );

    const data: DataImport[] = rows.map(row => ({
        id: row.id,
        nama: row.nama,
        dob: formatDate(row.dob),
        kecamatan: row.kecamatan,
        kelurahan: row.kelurahan,
        file: row.file,
        users: row.users,
        gender: row.gender
    }))

    return processDOBAndGender(data);
}

export const createDataImport = async(
    nama : string, 
    dob: string,
    ttl: string, 
    kecamatan: string, 
    kelurahan: string,
    file: string,
    users: string
) => {
    const query = 'INSERT INTO data_import(nama, dob, ttl, kecamatan, kelurahan, file, users) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [nama, dob, ttl, kecamatan, kelurahan, file, users])
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