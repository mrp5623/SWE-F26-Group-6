const { Pool } = require("pg"); //import connection pool from postgres

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, //use URL from .env
});

module.exports = pool; //let other files import our pool