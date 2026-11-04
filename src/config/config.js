const base = {
    username: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "1",
    database: process.env.DB_NAME || "BattleRapDB",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 1433,
    dialect: "mssql",
    quoteIdentifiers: true,
    dialectOptions: {
        options: { encrypt: true, trustServerCertificate: true },
    },
};

module.exports = {
    development: base,
    test: { ...base, database: "BattleRapDB_Test" },
    production: base,
};