const dbConfig = {
    development: {
        username: process.env.dbUserName,
        password: process.env.dbPassword,
        database: "StudentManagementTool",
        host: process.env.dbHost,
        dialect: "mysql"
    },
    test: {
        username: process.env.dbUserName,
        password: process.env.dbPassword,
        database: "StudentManagementTool_Test",
        host: process.env.dbHost,
        dialect: "mysql"
    },
    production: {
        username: process.env.dbUserName,
        password: process.env.dbPassword,
        database: "StudentManagementTool_Production",
        host: process.env.dbHost,
        dialect: "mysql"
    }
}

module.exports = dbConfig;