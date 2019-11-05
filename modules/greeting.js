'use strict';
const fs = require("fs");
var modules = {
	description: 'Music module'
};
const datDir = '/data/dependencies/greet';

modules.greet = function(client, message, args) {
	if(args.length == 0) {
		return client.helper.sendHelpMessage(message, 'ABC', true);
	}
	let subCommand = args.shift();
	if(subCommand == 'message') {
		let msg = args.join(' ');
		if(!msg) {
			return message.channel.send('Nội dung hiện tại:\n`' + client.greet.message + '`\n\nSử dụng :member để tag user');
		}
		client.greet.message = msg;
		let data = JSON.stringify(client.greet, null, 4);
    	fs.writeFileSync(`.${datDir}/greet.json`, data, 'utf8', 'w', (err) => {
	        if (err) {
	            console.log(err);
	        }
    	});
    	message.channel.send('Nội dung hiện tại:\n`' + client.greet.message + '`\n\nSử dụng :member để tag user');
	}

	if(subCommand == 'enable') {
		client.greet.enable = true;
		let data = JSON.stringify(client.greet, null, 4);
    	fs.writeFileSync(`.${datDir}/greet.json`, data, 'utf8', 'w', (err) => {
	        if (err) {
	            console.log(err);
	        }
    	});
    	return message.channel.send('Đã bật message welcome!');
	}

	if(subCommand == 'disable') {
		client.greet.enable = false;
		let data = JSON.stringify(client.greet, null, 4);
    	fs.writeFileSync(`.${datDir}/greet.json`, data, 'utf8', 'w', (err) => {
	        if (err) {
	            console.log(err);
	        }
    	});
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
		if(client.greet.enable)
			return message.channel.send('Enable!');
		message.channel.send('Disable!');
	}
};

module.exports = modules;