const sql = require('mssql');

(async () => {
    const pool = await sql.connect({
        user: 'sa',
        password: '1',
        server: 'localhost',
        database: 'BattleRapDB',
        options: { encrypt: false, trustServerCertificate: true }
    });

    const result = await pool.request().query(`
    SELECT
      fk.name AS fk_name,
      OBJECT_NAME(fk.parent_object_id) AS child_table,
      COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS child_column,
      OBJECT_NAME(fk.referenced_object_id) AS parent_table,
      COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS parent_column
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE OBJECT_NAME(fk.parent_object_id) = 'Bars' OR OBJECT_NAME(fk.referenced_object_id) = 'AllCodes';
  `);

    console.log(JSON.stringify(result.recordset, null, 2));
    await pool.close();
})().catch(err => {
    console.error(err);
    process.exit(1);
});
