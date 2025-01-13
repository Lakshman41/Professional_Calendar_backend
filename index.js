require("dotenv").config();
const users=require("./DB/users");
const Events=require("./DB/Events");
const express= require('express');
const ngrok= require('ngrok');
const cors = require("cors");
const jwt=require('jsonwebtoken');
const jwtkey= process.env.JWT_SECRET || 'dashboard';
const app =express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
const authenticateToken = (req, resp, next) => {
    const token = req.headers['authorization'];
    //const token = authHeader && authHeader.split(' ')[1];

    //console.log(token);

    if (!token) return resp.status(401).send({ message: 'Unauthorized' });

    jwt.verify(token, 'dashboard', (err, user) => {
        if (err) {
            console.log(err);
            return resp.status(403).send({ message: 'Forbidden' });
        }
            req.user = user; // Add the user payload to the request object
        next();
    });
};
app.post("/register",async (req,resp)=>{
    const user=new users();
    const result=await user.signup(req.body['name'],req.body['email']);
    //console.log(req.body['email_id']);
    resp.send(result);
});

app.get("/login/:id",async (req,resp)=>{
    // console.log(req.params.id);
    const user=new users();
    const file=await user.login(req.params.id);
    // console.log(file.name);
    var token='';
    if(file['message']==='User Found'){
        token = jwt.sign(
            { user_email: req.params.id, user_name: file['name'] },
            'dashboard',
            { expiresIn: '1h' }
        );
    }
    resp.send(JSON.stringify({file,token}));
    // console.log(file["name"]);
    //resp.send(JSON.stringify(result));
});

app.post("/create", authenticateToken,async (req,resp)=>{
    const event=new Events();
    const response=await event.insert(req.user.user_email,req.body['Title'],req.body['date'],req.body['time'],req.body['description']);
    //console.log(req.body['email_id']);
    resp.send(response);
});

app.get("/list", authenticateToken,async (req,resp)=>{
    const email_id = req.user.user_email;
    //console.log(email_id);
    const event=new Events();
    const response=await event.getall(email_id);
    //console.log(response['message']);
    resp.send(response);
});

app.delete("/list/:id", authenticateToken,async (req,resp)=>{
    const event=new Events();
    const response=await event.delete_event(req.params.id);
    resp.send(response);
});

app.get("/list/:id", authenticateToken,async (req,resp)=>{
    const event=new Events();
    const response=await event.getone(req.params.id);
    resp.send(response);
});

app.put("/list/:id", authenticateToken,async (req,resp)=>{
    const event=new Events();
    // console.log(req.params.id);
    const response=await event.updateone(req.params.id,req.body['title'],req.body['date'],req.body['time'],req.body['description']);
    resp.send(response);
});

app.get("/search/:key", authenticateToken,async(req,resp)=>{
    const email_id = req.user.user_email;
    const event=new Events();
    // console.log(req.params.id);
    const response=await event.getallike(req.params.key,email_id);
    resp.send(response);
});

app.get("/health", async(req, resp) => {
    resp.status(200).json({ 
        message: "Health check passed",
        timestamp: new Date().toISOString()
    });
});

// Start server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});