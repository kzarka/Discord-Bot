const { MongoClient } = require("mongodb");
const config = require("../../config/config.json");

const uri = `mongodb+srv://xuan:${config.cluster_pass}@cluster0.nnunb.mongodb.net?retryWrites=true&w=majority`;

var driver = {};

driver.connect = async function ()
{
    var client = null;
    client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
    await client.connect();
    const database = client.db('black_spirit');
    return {
        'db': database,
        'client': client
    }
}

driver.insert = async function (table, data) {
    var status = false;
    try {
        var connection = await driver.connect();
        var database = connection.db;
        var collection = database.collection(table);
        data['created_at'] = new Date();
        var result = await collection.insertOne(data);

        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        await connection.client.close();
        return status;
    }
}

driver.fetch = async function (table, query = {}) {
    var result = false;
    try {
        var connection = await driver.connect();
        var database = connection.db;
        var collection = database.collection(table);

        result = await collection.find(query).toArray();
    } catch (e) {
        console.log(e);
        result = false;
    } finally {
        // Ensures that the client will close when you finish/error
        await connection.client.close();
        return result;
    }
}

driver.update = async function (table, query, data) {
    var status = false;
    try {
        var connection = await driver.connect();
        var database = connection.db;
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
        await connection.client.close();
        return status;
    }
}

driver.delete = async function (table, query) {
    var status = false;
    try {
        var connection = await driver.connect();
        var database = connection.db;
        var collection = database.collection(table);
        await collection.deleteOne(query);
        status = true;
    } catch (e) {
        console.log(e);
        status = false;
    } finally {
        // Ensures that the client will close when you finish/error
        await connection.client.close();
        return status;
    }
}

driver.insertOrUpdate = async function (table, query, data) {
    var status = false;
    try {
        var connection = await driver.connect();
        var database = connection.db;
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
        await connection.client.close();
        return status;
    }
}

module.exports = driver;

//run().catch(console.dir);