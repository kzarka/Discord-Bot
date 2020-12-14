const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://xuan:anh123@cluster0.nnunb.mongodb.net?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });

var driver = {};

driver.connect = async function ()
{
    await client.connect();
    const database = client.db('black_spirit');
    return database;
}

driver.insert = async function (table, data) {
    var status = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);

        var result = await collection.insertOne(data);

        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        return status;
    }
}

driver.fetch = async function (table, query = {}) {
    var result = false;
    try {
        await client.connect();
        var database = client.db('black_spirit');
        var collection = database.collection(table);

        result = collection.find(query);
        result = await result.toArray();
    } catch (e) {
        console.log(e);
        result = false;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        return result;
    }
}

driver.insertOrUpdate = async function (table, query, data) {
    var status = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);

        var options = { upsert: true };
        collection.updateOne(query, data, options);
        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        return status;
    }
}

module.exports = driver;

//run().catch(console.dir);