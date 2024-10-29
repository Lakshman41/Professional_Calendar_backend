require("dotenv").config();
const users=require("./DB/users");
const Events=require("./DB/Events");
const express= require('express');
const ngrok= require('ngrok');
const cors = require("cors");
const app =express();
const PORT = 5000
app.use(express.json());
app.use(cors());
app.post("/register",async (req,resp)=>{
    const user=new users();
    const result=await user.signup(req.body['name'],req.body['email']);
    //console.log(req.body['email_id']);
    resp.send(result);
});

app.get("/login/:id",async (req,resp)=>{
    console.log(req.params.id);
    const user=new users();
    const file=await user.login(req.params.id);
    resp.setHeader({'Content-Type': 'application/json'});
    resp.json(file);
    //resp.send(JSON.stringify(result));
});

app.post("/create",async (req,resp)=>{
    const event=new Events();
    const response=await event.insert(req.body['email_id'],req.body['Title'],req.body['date'],req.body['time'],req.body['description']);
    //console.log(req.body['email_id']);
    resp.send(response);
});

app.get("/list",async (req,resp)=>{
    const email_id = req.query.email_id;
    const event=new Events();
    const response=await event.getall(email_id);
    //console.log(response['message']);
    resp.send(response);
});

app.delete("/list/:id",async (req,resp)=>{
    const event=new Events();
    const response=await event.delete_event(req.params.id);
    resp.send(response);
});

app.get("/list/:id",async (req,resp)=>{
    const event=new Events();
    const response=await event.getone(req.params.id);
    resp.send(response);
});

app.put("/list/:id",async (req,resp)=>{
    const event=new Events();
    // console.log(req.params.id);
    const response=await event.updateone(req.params.id,req.body['title'],req.body['date'],req.body['time'],req.body['description']);
    resp.send(response);
});

app.get("/search/:key",async(req,resp)=>{
    const email_id = req.query.email_id;
    const event=new Events();
    // console.log(req.params.id);
    const response=await event.getallike(req.params.key,email_id);
    resp.send(response);
});
// app.get("/data/:id",async (req,resp)=>{
//     const event=new Events();
//     const response=await event.(req)
// });

app.listen(PORT,()=>{
    console.log(`localhost running on: http://localhost:${PORT}`);

    ngrok.connect(PORT).then(ngrokUrl=>{
        console.log(`Ngrok tunnel in: ${ngrokUrl}`);
    }).catch(error=>{
        console.log(`Couldn't tunnel ngrok: ${error}`);
    })
});