//importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from "./dbmessages.js";
import Pusher from "pusher";
//app config
const app=express();
const port=process.env.PORT || 9000;
const pusher=new Pusher({
  appId: '1085122',
  key: 'e54c89872ff1aa7ff0ab',
  secret: '137505029ad50eba2235',
  cluster: 'ap2',
  encrypted: true
});
app.use(express.json());
//middleware
//db config
const connection_url='mongodb+srv://admin:WC20PdIQYe10h26P@cluster0.p0peb.mongodb.net/mymessagedb?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db=mongoose.connection
db.once('open',()=>{
    console.log("Db CONNECTED");
    const msgcollection=db.collection("messagecontents");
    const changeStream=msgcollection.watch();
    changeStream.on("change",(change)=>{
        console.log("a change occured",change);
        if(change.operationType ==='insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.user,
                message:messageDetails.message
            }
            );
        }
            else{
                console.log('Error triggering pusher');
            }
    
    });
});
//api routes
app.get("/",(req,res)=>res.status(200).send('hello world'));
app.get('/messages/sync',(req,res)=>{
    //to get all messages
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})
app.post("/messages/new",(req,res)=>{
    //to create new message
    const dbMessage=req.body
    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(`new message craeted:\n ${data}`)
        }
    })
})
//listen
app.listen(port,()=>console.log(`listening on port:${port}`));
//get-fetching all request
//post-pushing all request
//delete-admin 