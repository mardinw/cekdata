import { db } from "../utils/db";

export const insertSubscriptions = async(
    uuid: string,
    limit_count: number,
    is_active: number,
    createdAt: number,
) => {
    const query = 'INSERT INTO subscriptions(users, limit_count, is_active, created_at) VALUES(?, ?, ?, ?)';
    const [result]  =  await db.query(query, [uuid, limit_count, is_active, createdAt]);
    return result;
}

export const setActiveSubscriptions = async( 
    is_active: boolean,
    uuid: string,
) => {
    const query = 'UPDATE subscriptions SET is_active = ? WHERE users = ?';
    const [result] = await db.query(query, [is_active, uuid]);
    return result;
}

export const getSubscriptionsByUUID = async(
    uuid: number,
) => {
    const query = 'SELECT limit_count, is_active, created_at FROM subscriptions WHERE users = ?';
    const [result] = await db.query(query, uuid);
    return result;
}

export const getSubscriptionsByAdmin = async() => {
    const query = 'SELECT t1.users as uuid, t2.name as name, t1.limit_count as limit_count, t1.is_active, t1.created_at FROM subscriptions t1 INNER JOIN users t2 ON t2.id = t1.users GROUP BY t1.users';
    const [result] = await db.query(query);
    return result;
}