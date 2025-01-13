const { Client } = require('pg');
require("dotenv").config();
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL!"))
  .catch((err) => console.error("Connection error", err.stack));

class Users {
    constructor() {}

    async signup(name,email_id) {
        try {
            // Get the current count
            const countResult = await client.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
            const count = parseInt(countResult.rows[0].id) + 1;

            // Insert the new user
            const sql = "INSERT INTO users (id,name,email) VALUES ($1,$2,$3)";
            const values = [count,name,email_id];
            const selectResult = await client.query(sql, values);

            return JSON.stringify({'message':'Registered'});


            //console.log("Inserted successfully with ID:", count);
        } catch (err) {
            console.error("Query error:", err.stack);
            return JSON.stringify({'message':'Not Registered'});
        }
    }
    async login(email_id) {
        try {
            // Get the current count
            //const countResult = await client.query('SELECT COUNT(*) FROM users');
            //const count = parseInt(countResult.rows[0].count) + 1;

            // Insert the new user
            const sql = "SELECT name FROM users WHERE email=$1";
            const values = [email_id];
            const selectResult = await client.query(sql, values);
            let user = selectResult.rows[0];
            // console.log(user.name);

            if(selectResult.rows.length === 0){
                return {'message':'User does not exist'};
            }
            else{
                //console.log(selectResult.rows[3]);
                //console.log(user.name);
                return {'message':'User Found','name':user.name}; 
            }

            //console.log("Inserted successfully with ID:", count);
        } catch (err) {
            console.error("Query error:", err.stack);
            return {"message":"Error inserting user"};
        }
    }
}

module.exports = Users;
