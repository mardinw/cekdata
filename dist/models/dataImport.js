import { db } from "../utils/db.js";
export const getDataImport = async (file, users) => {
    const [rows] = await db.query('SELECT * FROM data_import WHERE file = ? AND users = ?', [file, users]);
    const data = rows.map(row => ({
        id: row.id,
        nama: row.nama,
        ttl: row.ttl,
        alamat: row.alamat,
        kecamatan: row.kecamatan,
        kelurahan: row.kelurahan,
        file: row.file,
        users: row.users,
        gender: row.gender
    }));
    return data;
};
export const getDataFileByUUIDOnly = async (uuid) => {
    const query = 'SELECT count(file) as jumlah_data, file as nama_file, users FROM data_import WHERE users = ? GROUP BY file, users';
    const [result] = await db.query(query, [uuid]);
    return result;
};
export const previewDataFileByUUID = async (uuid, fileName) => {
    const query = 'SELECT nama, dob, alamat, kecamatan, kelurahan, file FROM data_import where users = ? AND file = ?';
    const [result] = await db.query(query, [uuid, fileName]);
    return result;
};
export const createDataImport = async (dataToInsert) => {
    const query = 'INSERT INTO data_import(nama, dob, gender, kecamatan, kelurahan, ttl, file, users) VALUES ?';
    const [result] = await db.query(query, [dataToInsert]);
    return result;
};
export const updateDataImport = async (filter, file, uuid) => {
    let query = 'UPDATE data_import';
    let params = [];
    if (filter) {
        const conditions = [];
        if (filter.nama) {
            conditions.push('nama = ?');
            params.push(filter.nama);
        }
        if (filter.dob) {
            conditions.push('dob = ?');
            params.push(filter.dob);
        }
        if (filter.kecamatan) {
            conditions.push('kecamatan = ?');
            params.push(filter.kecamatan);
        }
        if (filter.kelurahan) {
            conditions.push('kelurahan = ?');
            params.push(filter.kelurahan);
        }
        if (conditions.length > 0) {
            query += ' SET ' + conditions.join(', ');
        }
    }
    // cek kondisi jika uuid tersedia
    if (uuid) {
        query += ' WHERE id = ?';
        params.push(uuid);
    }
    else {
        throw new Error('UUID is required to update user.');
    }
    if (file) {
        query += ' AND file = ?';
        params.push(file);
    }
    else {
        throw new Error('UUID is required to update user.');
    }
    // eksekusi query
    const [rows] = await db.query(query, params);
    return rows;
};
export const getFileDataImport = async (uuid) => {
    const query = 'SELECT DISTINCT file FROM data_import WHERE users = ?';
    const [result] = await db.query(query, [uuid]);
    return result;
};
export const deleteDataImport = async (file) => {
    const query = 'DELETE FROM data_import WHERE file = ?';
    const [result] = await db.query(query, [file]);
    return result;
};
