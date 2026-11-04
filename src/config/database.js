const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME || "BattleRapDB",
    process.env.DB_USER || "sa",
    process.env.DB_PASSWORD || "1",
    {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 1433,
        dialect: "mssql",
        logging: false,
        quoteIdentifiers: true,
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        }
    }
);

module.exports = sequelize;