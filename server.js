const express=require('express');
const  bodyParser = require('body-parser')
const cors=require('cors')
const fileUpload=require('express-fileupload')
const morgan=require('morgan')
const routes=require('./src/routes/routes')
const mongo=require('./src/connections/mongodb/connection')
const path=require('path')


const Port=3000;
const app=express();

//Resource monitor.
app.use(require('express-status-monitor')())


//Handel application/json data
app.use(bodyParser.json())
app.use(bodyParser.json({limit: '50mb'}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


//setting up cors 
app.use(cors())


mongo.connect((err,db)=>{
    if(err)
        console.log(`Mongo Error :${err}`)
    else
     console.log(`Db :${db}`)
 })

 //setiing up File Upload LImit to 50Mb.
 app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    //useTempFiles: true,
    // dir for windows PC
    // tempFileDir: path.join(__dirname, './tmp'),
  }));


//setup static path.
app.use('/static', express.static(path.join(__dirname, 'public','Uploads')))

//Setup for Api Logs.
let count=0;
morgan.token('id',function getId(req){
    return req.id;
})


function assignId(req,res,next)
{
    req.id=count++;
    next();
}
app.use(assignId)
app.use(morgan('   :id |   :method | :url | :status | :response-time ms | :date[web] '));

 //settting up Routes.
 app.use(routes)

 const server =app.listen(Port,()=>{
    console.log(`Port is Running on ${Port}`)
})

//for any unhandeld exception just logging it to console for now.
process.on('uncaughtException',  (err)=> {
    console.log(`uncaughtException :${err}`);
    
  })

 //gracefully shuting down the server if any signal is recived.
  let signals=["SIGTERM","SIGINT"]
  for (let signal of signals){
    process.on(signal, ()=> {
        console.log(`${signal} Signal Recived`);
        server.close(()=>{
            console.log("http Server is Closing...")
        })
        process.exit(0)
      })
  }

  module.exports=server

