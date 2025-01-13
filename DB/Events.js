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

class Event{
    constructor(){}

    async insert(email,title,date,time,description){
        try {
            // Get the current count
            const countResult = await client.query('SELECT event_id FROM events ORDER BY event_id DESC LIMIT 1');
            var count = parseInt(countResult.rows[0].event_id) + 1;

            //console.log(name);

            var id = await client.query('SELECT id FROM users WHERE email=$1',[email]);
            id = parseInt(id.rows[0].id);

            // Insert the new user
            const sql = "SELECT * FROM events WHERE id=$1 and date=$2 and time=$3";
            const values = [id,date,time];
            const qResult = await client.query(sql, values);

            if(qResult.rows.length===0){
                const sql = "INSERT INTO events (event_id,id,title,date,time,description) VALUES($1,$2,$3,$4,$5,$6)";
                const values = [count,id,title,date,time,description];
                const qResult = await client.query(sql, values);
                return JSON.stringify({'message':'Event created Successfully'});
            }
            else {
                return JSON.stringify({'message':'An event already exist at this time'});
            }

            // console.log("Inserted successfully with ID:", count);
            // return "Inserted Successfully";
        }
        catch (err) {
            console.error("Query error:", err.stack);
            return "Error inserting us";
        }
    }
    async getall(email){
        try{
            var id = await client.query('SELECT id FROM users WHERE email=$1',[email]);
            id = parseInt(id.rows[0].id);

            var sql = "SELECT * FROM events WHERE id=$1";
            var values = [id];
            const qResult = await client.query(sql, values);
            
            var count = await client.query('SELECT COUNT(*) FROM events WHERE id=$1',[id]);
            count = parseInt(count.rows[0].count);
            
            if(qResult.rows.length===0){
                return JSON.stringify({'message':'You have no events to attend'});
            }
            else{
                let events_list=[]
                for(let i=0;i<count;i++){
                    var one=JSON.stringify({id:qResult.rows[i].event_id,title:qResult.rows[i].title,date:qResult.rows[i].date,time:qResult.rows[i].time,description:qResult.rows[i].description});
                    events_list.push(one);
                }
                return JSON.stringify({'message':'Here is the List','list':events_list});
            }
        }
        catch (err) {
            console.error("Query error:", err.stack);
            return "Error in listing";
        }
    }
    async delete_event(id){
        try{
            var sql = "DELETE FROM events WHERE event_id=$1";
            var values = [id];
            const qResult = await client.query(sql, values);
            return JSON.stringify({'message':"Deleted"});
        }
        catch (err) {
            console.error("Query error:", err.stack);
            return "Error in deleting";
        }
    }
    async getone(id){
        try{
            var sql = "SELECT * FROM events WHERE event_id=$1";
            var values = [id];
            const qResult = await client.query(sql, values);
            
            if(qResult.rows.length===0){
                return JSON.stringify({'message':'Id is wrong'});
            }
            else{               
                return JSON.stringify({'message':"Found Id",id:qResult.rows[0].event_id,title:qResult.rows[0].title,date:qResult.rows[0].date,time:qResult.rows[0].time,description:qResult.rows[0].description});
            }
        }
        catch (err) {
            console.error("Query error:", err.stack);
            return "Error in listing";
        }
    }
    async updateone(id,title,date,time,description){
        try{
            //console.log(id);
            var sql = "UPDATE events SET title=$1, date=$2, time=$3, description=$4 WHERE event_id=$5 RETURNING *;";
            var values = [title,date,time,description,id];
            const qResult = await client.query(sql, values);

            // console.log(qResult);
                          
            return JSON.stringify({'message':"Updated",id:qResult.rows[0].event_id,title:qResult.rows[0].title,date:qResult.rows[0].date,time:qResult.rows[0].time,description:qResult.rows[0].description});

        }
        catch (err) {
            console.error("Query error:", err.stack);
            return "Error in listing";
        }
    }
    async getallike(key,email){
        try{
            // console.log(key);
            // console.log(email);
            var id = await client.query('SELECT id FROM users WHERE email=$1',[email]);
            id = parseInt(id.rows[0].id);

            //console.log(id);
            
            var count = await client.query('SELECT COUNT(*) FROM events WHERE title ILIKE $1 and id=$2;',[`%${key}%`,id]);
            count = parseInt(count.rows[0].count);

            //console.log(count);

            var sql = "SELECT * FROM events WHERE title ILIKE $1 and id=$2;";
            var values = [`%${key}%`,id];
            const qResult = await client.query(sql, values);

            //console.log(qResult.rows[0].title);

            var count1 = await client.query('SELECT COUNT(*) FROM events WHERE description ILIKE $1 and id=$2;',[`%${key}%`,id]);
            count1 = parseInt(count1.rows[0].count);

            var sql = "SELECT * FROM events WHERE description ILIKE $1 and id=$2;";
            var values = [`%${key}%`,id];
            const qResult1 = await client.query(sql, values);

            let events_list=[]
            var flag=0;
            if(count>0){
                for(let i=0;i<count;i++){
                    var one= JSON.stringify({id:qResult.rows[i].event_id,title:qResult.rows[i].title,date:qResult.rows[i].date,time:qResult.rows[i].time,description:qResult.rows[i].description});
                    events_list.push(one);
                }
                flag=1;
            }
            if(count1>0){
                for(let i=0;i<count1;i++){
                    var one= JSON.stringify({id:qResult1.rows[i].event_id,title:qResult1.rows[i].title,date:qResult1.rows[i].date,time:qResult1.rows[i].time,description:qResult1.rows[i].description});
                    const isDuplicate = events_list.some(event => event.id === one.id);
                    if (!isDuplicate) {
                        events_list.push(one);
                    }
                }
                flag=1;
            }
            if(flag===0){
                return JSON.stringify({'message':'no matching results'})
            }
            else{
                return JSON.stringify({'message':'Fetched','list':events_list});
            }
            // console.log(qResult);

        }
        catch (err) {
            console.error("Query error:", err.stack);
            return "Error in listing";
        }
    }
}

module.exports = Event;