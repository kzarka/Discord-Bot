'use strict';

var modules = {
	description: 'Music module'
};

const dataDir = '/data/modules/setting/';

modules.set = async function(client, message, args) {
	if(args.length == 0) return;
	if(args[0] == 'channel') {
		if(!client.helper.canManage(message)) return message.channel.send('Bạn không có quyền đặt channel');
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
	if(args.length == 0) return;
	if(args[0] == 'init') {
		client.guildsModel.sync(client);
		message.channel.send('Synced!');
	}
}