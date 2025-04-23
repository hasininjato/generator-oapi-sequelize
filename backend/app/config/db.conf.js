const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.POSTGRESDB_DATABASE,
    process.env.POSTGRESDB_USER,
    process.env.POSTGRESDB_ROOT_PASSWORD,
    {
        host: process.env.POSTGRESDB_HOST || 'sample_test_sql',
        dialect: 'postgres',
        port: 5432,
        logging: false,
    }
);

module.exports = sequelize;
