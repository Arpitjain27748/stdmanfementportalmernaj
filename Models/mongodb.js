

const mongoClient = require('mongodb').MongoClient
const url = "mongodb+srv://arpitjain27748:Arpit%4027748@cluster01.kicvrai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01";
const client = new mongoClient(url);

module.exports={
    getconnect:async function getconnect() {
        let result = await client.connect();
        return db= result.db("myadmindata")
    },
    getdisconnect: async function disconnect() {
      return await client.close();  
    }
}