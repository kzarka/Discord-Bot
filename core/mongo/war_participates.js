const driver = require("./driver.js");
const TABLE = 'war_participates';

var participates = {};

participates.insert = async function (data) {
	return await driver.insert(TABLE, data);
}

participates.fetch = async function (query = {}) {
	return driver.fetch(TABLE, query);
}

participates.insertOrUpdate = async function (query, data) {
	return driver.insertOrUpdate(TABLE, query, data);
}

participates.fetchByGuildId = async function (guildId, warId) {
	var query = {'guild_id': guildId, 'war_id': warId};
	let result = await participates.fetch(query);
    let items = {};
	for(let x in result) {
        items[result[x].member_id] = result[x];
    }

    return items;
}

participates.delete = async function  (query) {
    return driver.delete(TABLE, query);
}

participates.loadMemberByGuilds = async function (client) {
    client.guilds.cache.forEach(async guild => {
        let guildId = guild.id;

        let result = await participates.fetchByGuildId(guildId, warId);
        if(!client.guildsData) {
            client.guildsData = {};
        }
        if(!client.guildsData[guildId]) {
            client.guildsData[guildId] = {
                joined: {}
            };
        }
        client.guildsData[guildId].joined = result;
        //console.log(client.guildsData);
    });
}

participates.fetchByMemberId = async function (memberId, guildId) {
    let query = {guild_id: guildId, member_id: memberId};
    let result = await driver.lookup(TABLE, 'wars', 'war_id', '_id', 'war', query);
    
    return result;
}

participates.fetchWarMemberCountByGuildId = async function (guildId) {
    let query = {guild_id: guildId};
    let result = await driver.lookup(TABLE, 'wars', 'war_id', '_id', 'war', query);
    let items = {};
    for(let x in result) {
        let member_id = result[x].member_id
        if(items[member_id]) {
            items[member_id] = items[member_id]+1;
        } else {
            items[member_id] = 1;
        }
    }
    return items;
}

module.exports = participates;