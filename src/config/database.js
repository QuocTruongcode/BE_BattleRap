const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "BattleRapDB",
    "sa",
    "1",
    {
        host: "localhost",
        dialect: "mssql",
        logging: false,
        quoteIdentifiers: true
    }
);

module.exports = sequelize;