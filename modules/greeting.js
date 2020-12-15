'use strict';
const fs = require("fs");
var modules = {
	description: 'Music module'
};
const datDir = '/data/dependencies/greet';

modules.greet = async function(client, message, args) {
	if(args.length == 0) {
		return client.helper.sendHelpMessage(message, 'ABC', true);
	}
	let subCommand = args.shift();
	if(subCommand == 'message') {
		let msg = args.join(' ');
		if(!msg) {
			let currentMsg = client.guildsData[message.guild.id].welcome_message;
			console.log(client.guildsData[message.guild.id]);
			if(!currentMsg) {
				return message.channel.send('Bạn chưa cài nội dung welcome.') 
			}
			return message.channel.send('Nội dung hiện tại:\n`' + currentMsg + '`\n\nSử dụng :member để tag user');
		}
		console.log(msg);

		let data = {
			welcome_message: msg
		}
		await client.guildsModel.updateByGuildId(client, message.guild.id, data); 
		
    	message.channel.send('Nội dung hiện tại:\n`' + msg + '`\n\nSử dụng :member để tag user');
	}

	if(subCommand == 'enable') {
		let data = {
			welcome_enable: 1
		}
		await client.guildsModel.updateByGuildId(client, message.guild.id, data); 
    	return message.channel.send('Đã bật message welcome!');
	}

	if(subCommand == 'disable') {
		let data = {
			welcome_enable: 0
		}
		await client.guildsModel.updateByGuildId(client, message.guild.id, data);
    	return message.channel.send('Đã tắt message welcome!');
	}

	if(subCommand == 'test') {
		let user = message.author;
		let member = null;
		if (user) member = message.guild.member(user);
		if(!member) return;
		client.emit("guildMemberAdd", member);
	}

	if(subCommand == 'status') {
		if(client.guildsData[message.guild.id].welcome_enable)
			return message.channel.send('Enable!');
		message.channel.send('Disable!');
	}

	if(subCommand == 'channel') {
		let data = {
			welcome_channel: message.channel.id
		}
		await client.guildsModel.updateByGuildId(client, message.guild.id, data); 
    	return message.channel.send('Kênh được chọn làm kênh guest!');
	}
};

module.exports = modules;