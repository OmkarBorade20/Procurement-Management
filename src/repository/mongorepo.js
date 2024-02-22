const Db=require('../connections/mongodb/connection');



module.exports.find=async function (collection)
{
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let data=await coll.find({}).toArray();
   return data;
}

module.exports.findQuery=async function (collection,query)
{
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let data=await coll.find(query).toArray();
   return data;
}

module.exports.insertMany=async function (collection,data)
{
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let insert_details=await coll.insertMany(data);
   return insert_details;
}

module.exports.insertOne=async function (collection,data)
{
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let insert_details=await coll.insertOne(data);
   return insert_details;
}

module.exports.updateOne=async function(collection,query,data){
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let update_details=await coll.updateOne(query,data);
   return update_details;
   
}

module.exports.findOneAndUpdate=async function(collection,query,data){
   let options={  upsert: true,
      returnNewDocument: true };
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let update_details=await coll.findOneAndUpdate(query,data,options);
   return update_details;
   
}


module.exports.aggregation=async function(collection,pipeline){
   let Database= Db.getDb();
   let coll=Database.collection(collection)
   let data=await coll.aggregate(pipeline).toArray();
   return data;
 
}