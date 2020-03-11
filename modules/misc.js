'use strict';

var modules = {
	description: 'Music module'
};

const dataDir = '/data/modules/setting/';

modules.info = function(client, message, args) {
	if(args.length == 0) return;
	if(args[0] == 'channel') {
		return channel(client, message, args.shift());
	}
};

module.exports = modules;

function channel(client, message, args) {
	let content = `Connected to ${client.guilds.array().length} servers with total ${client.channels.array().length} channels!\n`;
	let index = 1;
	client.guilds.forEach(function(guild) {
		content += `${index++}. ${guild.name} - ${guild.channels.array().length} channels - ${guild.memberCount} members\n`;
	});
	message.channel.send(content);
}