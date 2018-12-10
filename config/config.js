module.exports = {
  development: {
    database: process.env.DB_SCHEMA,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: "127.0.0.1",
    dialect: "mysql",
    port: 3306,
    operatorsAliases: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
