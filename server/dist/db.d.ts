import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<void>;
export declare const closeConnection: () => Promise<void>;
export { pool };
export default pool;
//# sourceMappingURL=db.d.ts.map