const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://xuan:anh123@cluster0.nnunb.mongodb.net?retryWrites=true&w=majority";

var driver = {};

var client = null;

driver.connect = async function ()
{
    client = null;
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const database = client.db('black_spirit');
    return database;
}

driver.insert = async function (table, data) {
    var status = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);
        data['created_at'] = new Date();
        var result = await collection.insertOne(data);

        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
        return status;
    }
}

driver.fetch = async function (table, query = {}) {
    var result = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);

        result = await collection.find(query).toArray();
    } catch (e) {
        console.log(e);
        result = false;
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
        return result;
    }
}

driver.update = async function (table, query, data) {
    var status = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);
        data['updated_at'] = new Date();
        data = {
            $set: data,
            $setOnInsert: {
                created_at: new Date()
            }
        };
        var options = {};
        await collection.updateOne(query, data, options);
        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
        return status;
    }
}

driver.delete = async function (table, query) {
    var status = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);
        await collection.deleteOne(query);
        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
        return status;
    }
}

driver.insertOrUpdate = async function (table, query, data) {
    var status = false;
    try {
        var database = await driver.connect();
        var collection = database.collection(table);
        data['updated_at'] = new Date();
        data = {
            $set: data,
            $setOnInsert: {
                created_at: new Date()
            }
        };
        var options = { upsert: true };
        await collection.updateOne(query, data, options);
        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
        return status;
    }
}

module.exports = driver;

//run().catch(console.dir);