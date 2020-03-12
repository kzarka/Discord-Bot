'use strict';

var modules = {
	description: 'Music module'
};

const dataDir = '/data/modules/setting/';

modules.set = async function(client, message, args) {
	if(args.length == 0) return;
	if(args[0] == 'channel') {
		client.guildsData[message.guild.id].main_channel = message.channel.id;
		let data = {
			main_channel: message.channel.id
		}
		await client.guildsModel.update(message.guild.id, data); 
		message.channel.send('Được chọn là channel chính.');
		client.emit('reload_topic', []);
	}

	if(args[0] == 'guild') {
		message.channel.send('guild');
		args.shift()
		guildFunction(client, message, args);
	}
};

module.exports = modules;

function guildFunction(client, message, args) {
	message.channel.send('abcd');
	if(args.length == 0) return;
	if(args[0] == 'init') {
		message.channel.send('abc');
		client.guildsModel.sync(client);
	}
}