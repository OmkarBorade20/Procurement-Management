const { MongoClient } = require('mongodb');



    require('dotenv').config()


// Connection URL
const url = process.env.MONGODB_URL;
//|| "mongodb+srv://TaskManager:taks2011@cluster0.dxoxr.mongodb.net/Procuremnet-Management-System?authSource=admin&replicaSet=atlas-82j5fk-shard-0&readPreference=primary&ssl=true"
const client = new MongoClient(url);

// Database Name
const dbName ='Procuremnet-Management-System';

let Db;
async function connect() {
 let con=await client.connect();
 Db=con.db(dbName)

 console.log(`connected to Db:${Db.databaseName}.`)
  return Db;
}

function getDb()
{
  return Db;
}




module.exports={connect,getDb}