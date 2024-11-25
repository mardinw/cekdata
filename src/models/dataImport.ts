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
        alamat: row.alamat,
        kecamatan: row.kecamatan,
        kelurahan: row.kelurahan,
        file: row.file,
        users: row.users,
        gender: row.gender
    }))

    return data;
}
export const getDataImportByAdmin = async (file?: string) => {
    const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM data_import WHERE file = ?',
        [file]
    );

    
    const data: DataImport[] = rows.map(row => ({
        id: row.id,
        nama: row.nama,
        ttl: row.ttl,
        alamat: row.alamat,
        kecamatan: row.kecamatan,
        kelurahan: row.kelurahan,
        file: row.file,
        users: row.users,
        gender: row.gender
    }))

    return data;
}

export const getDataFileByUUIDOnly = async( uuid: string) => {
    const query = 'SELECT count(t1.file) as jumlah_data, t1.file as nama_file, t2.name from data_import t1 INNER JOIN users t2 ON t1.users = t2.id WHERE t1.users = ? GROUP BY t1.file, t1.users';
    const [result] = await db.query(query, [uuid])
    return result;
}

export const getDataFileByAdminOnly = async() => {
    const query = 'SELECT count(t1.file) as jumlah_data, t1.file as nama_file, t2.name from data_import t1 INNER JOIN users t2 ON t1.users = t2.id GROUP BY t1.file, t1.users';
    const [result] = await db.query(query)
    return result;
}

export const previewDataFileByUUID = async( uuid: string, fileName?: string) => {
    const query = 'SELECT nama, dob, alamat, kecamatan, kelurahan, file FROM data_import where users = ? AND file = ?';
    const [result] = await db.query(query, [uuid, fileName]);
    return result;
}

export const previewDataFileByAdmin = async(fileName?: string) => {
    const query = 'SELECT nama, dob, alamat, kecamatan, kelurahan, file FROM data_import where file = ?';
    const [result] = await db.query(query, [fileName]);
    return result;
}

export const createDataImport = async(dataToInsert: string[][]) => {
    const query = 'INSERT INTO data_import(nama, dob, gender, alamat, kecamatan, kelurahan, ttl, file, users) VALUES ?';
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
    uuid?: string
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
    // cek kondisi jika uuid tersedia
    if(uuid) {
        query += ' WHERE id = ?';
        params.push(uuid);
    } else {
        throw new Error('UUID is required to update user.');
    }
    
    if(file) {
        query += ' AND file = ?';
        params.push(file);
    } else {
        throw new Error('UUID is required to update user.');
    }

    // eksekusi query
    const [rows] = await db.query(query, params);
    return rows;
}

export const getFileDataImport = async(uuid: string) => {
    const query = 'SELECT DISTINCT file FROM data_import WHERE users = ?';
    const [result] = await db.query(query, [uuid]);
    return result;
}

export const deleteDataImport = async(file?: string) => {
    const query = 'DELETE FROM data_import WHERE file = ?';
    const [result] = await db.query(query, [file]);
    return result;
}