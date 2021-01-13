const driver = require("./driver.js");
const TABLE = 'wars';

var wars = {};

wars.insert = async function (data) {
	return await driver.insert(TABLE, data);
}

wars.fetch = async function (query = {}) {
	return await driver.fetch(TABLE, query);
}

wars.insertOrUpdate = async function (query, data) {
	return await driver.insertOrUpdate(TABLE, query, data);
}

wars.creatWar = async function (guildId, data) {
    await wars.disableWar(guildId);
    return await wars.insert(data);
}
wars.disableWar = async function (guildId) {
    var query = {'guild_id': guildId, 'active': 1};
    var data = {'active': 0};
    let result = await driver.update(TABLE, query, data);

    return result;
}

wars.updateWar = async function (guildId, data) {
    let nextWar = await wars.fetchNextWarByGuildId(guildId);
    if(!nextWar) return false;
    var query = {'_id': nextWar._id};
    await driver.update(TABLE, query, data);

    return true;
}

wars.fetchByGuildId = async function (guildId) {
	var query = {'guild_id': guildId, 'active': 1};
	let result = await wars.fetch(query);
    let items = {};
	for(let x in result) {
        items[result[x]._id] = result[x];
    }

    return items;
}

wars.fetchByMemberId = async function (memberId) {
    let result = await driver.lookup('war_participates');
    let items = {};
    for(let x in result) {
        items[result[x]._id] = result[x];
    }

    return items;
}

wars.fetchNextWarByGuildId = async function (guildId) {
    var query = {'guild_id': guildId, 'active': 1}; // only one active war
    let result = await wars.fetch(query);
    let items = {};
    if(!result) return null;
    return result[0]; // first element
}

wars.loadWarByGuilds = async function (client) {
    client.guilds.cache.forEach(async guild => {
        let guildId = guild.id;
        let result = await wars.fetchByGuildId(guildId);
        if(!client.guildsData) {
            client.guildsData = {};
        }
        if(!client.guildsData[guildId]) {
            client.guildsData[guildId] = {
                wars: {}
            };
        }

        client.guildsData[guildId].wars = Object.values(result)[0];
    });
}

module.exports = wars;