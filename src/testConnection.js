const sequelize = require("./config/database");

async function test() {
    try {
        await sequelize.authenticate();
        console.log("Database connected!");
    } catch (error) {
        console.error(error);
    }
}

test();