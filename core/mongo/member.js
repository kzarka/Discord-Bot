const driver = require("./driver.js");
const TABLE = 'members';

var members = {};

members.insert = async function (data) {
	return await driver.insert(TABLE, data);
}

members.fetch = async function (query = {}) {
	return await driver.fetch(TABLE, query);
}

members.insertOrUpdate = async function (query, data) {
	return await driver.insertOrUpdate(TABLE, query, data);
}

module.exports = members;