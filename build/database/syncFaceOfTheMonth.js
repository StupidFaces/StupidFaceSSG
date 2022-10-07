const { Pool } = require('pg');
require("dotenv").config({path: `.${process.env.NODE_ENV}.env`});
const faceOfTheMonths = require('./faceOfTheMonth')

const pgPool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
})

async function main() {

    console.log(`NODE_ENV: ${process.env.NODE_ENV}`)


    for (let faceOfTheMonth of faceOfTheMonths) {
        console.log(faceOfTheMonth)
        await persist(faceOfTheMonth.assetId, faceOfTheMonth.yearMonth, 'was');
    }
}



async function persist(assetId, monthYear, owner) {
    const connection = await pgPool.connect();
    const insertSql = `INSERT INTO ${process.env.FACE_OF_THE_MONTH_TABLE}(asset_id, month_year, hodler_public_key) VALUES($1, $2, $3)`;

    const values = [
        assetId,
        monthYear + '-01T08:00:00.001Z',
        owner
    ]

    try {
        await pgPool.query(insertSql, values);
    } catch (error) {
        console.error(error)
    } finally {
        connection.release()
    }
}

main();