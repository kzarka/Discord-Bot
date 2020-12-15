const driver = require("./driver.js");
const TABLE = 'guilds';

var guilds = {};

guilds.insert = async function (data) {
	return await driver.insert(TABLE, data);
}

guilds.fetch = async function (query = {}) {
	return await driver.fetch(TABLE, query);
}

guilds.insertOrUpdate = async function (query, data) {
	return await driver.insertOrUpdate(TABLE, query, data);
}

guilds.loadGuild = async function () {
	var result = await guilds.fetch({}); // fetch all guilds
	var items = [];
	for(let x in result) {
		items[result[x]._id] = {
			"main_channel": result[x].main_channel,
			"welcome_message": result[x].welcome_message || null,
			"welcome_channel": result[x].welcome_channel || null,
			"welcome_enable": result[x].welcome_enable || null,
			"join_date": result[x].created_at || null
		}
	}

	return items;
}

guilds.sync = async function(client) {
	return new Promise(async function(resolve, reject) {
		try {
			client.guilds.forEach(async guild => {
				let main_channel = 0;
				if(client.guildsData[guild.id] && client.guildsData[guild.id].main_channel) {
					main_channel = client.guildsData[guild.id].main_channel;
				}
				let data = {
					main_channel: main_channel
				}
				let query = {_id: guild.id};
				await guilds.insertOrUpdate(query, data);
			});
		} catch (e) {
			console.log(e);
			resolve(e);
			return;
		}

		client.guildsData = await guilds.loadGuild();
		resolve(true);
	});
}

guilds.updateByGuildId = async function (client, guildId, data) {
	let query = {_id: guildId};
	
	await guilds.insertOrUpdate(query, data);
	await guilds.syncData(client, guildId);
}

guilds.syncData = async function (client, guildId) {
	let query = {_id: guildId};
	let guild = await guilds.fetch(query);
	if(guild) {
		guild = guild[0];
	}
	let members = {};
	if(client.guildsData[guildId] && client.guildsData[guildId].members) {
		members = client.guildsData[guildId].members;
	}
	let guildsData = {
		"main_channel": guild.main_channel,
		"welcome_message": guild.welcome_message || null,
		"welcome_channel": guild.welcome_channel || null,
		"welcome_enable": guild.welcome_enable || null,
		"join_date": guild.created_at || null,
		"members": members
	};

	client.guildsData[guildId] = guildsData;
}

guilds.reload = async function (client) {
	client.guildsData = await guilds.loadGuild();
	await client.membersModel.loadMemberByGuilds(client);
}

guilds.create = async function (client, guildId) {
	let data = {guild_id: guildId, main_channel: 0};
	await guilds.insert(data);
	await guilds.syncData(client, guildId);
}

module.exports = guilds;