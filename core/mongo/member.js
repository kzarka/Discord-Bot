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

members.fetchByGuildId = async function (guildId) {
	var query = {'guild_id': guildId};
	let result = await members.fetch(query);
    let items = {};
	for(let x in result) {
        items[result[x].member_id] = result[x];
    }

    return items;
}

members.loadMemberByGuilds = async function (client) {
    client.guilds.cache.forEach(async guild => {
        let guildId = guild.id;
        let result = await members.fetchByGuildId(guildId);
        if(!client.guildsData) {
            client.guildsData = {};
        }
        if(!client.guildsData[guildId]) {
            client.guildsData[guildId] = {
                members: {}
            };
        }
        client.guildsData[guildId].members = result;
        //console.log(client.guildsData);
    });
}

module.exports = members;