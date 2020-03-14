'use strict';

var modules = {
	description: 'Music module'
};

const dataDir = '/data/modules/setting/';

modules.info = function(client, message, args) {
	if(args.length == 0) {
		return message.channel.send(buildInfoEmbed(client, message));
	}
	if(!client.helper.isMe(message.author)) return;
	if(args[0] == 'channel') {
		return channel(client, message, args.shift());
	}
};

module.exports = modules;

function channel(client, message, args) {
	let msgIndex = 0;
	let content[msgIndex] = `Connected to ${client.guilds.array().length} servers with total ${client.channels.array().length} channels!\n`;
	let index = 1;
	client.guilds.forEach(function(guild) {
		let selected = 'not selected';
		if(client.guildsData[guild.id] && client.guildsData[guild.id].main_channel && client.guildsData[guild.id].main_channel != 0) {
			selected = 'selected';
		}
		content[msgIndex] += `${index++}. ${guild.name} - ${guild.channels.array().length} channels - ${guild.memberCount} members | ${selected}\n`;
		if(index % 10 == 0) {
			msgIndex++;
		}
	});
	for(let i = 0; i < msgIndex; i ++) {
		message.channel.send(content[i]);
	}
	
}

function buildInfoEmbed(client, message) {
	const embed = new client.Discord.RichEmbed()
        //.setTitle("This is your title, it can hold 256 characters")
        //.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .setAuthor("Black Spirit Bot", "https://i.imgur.com/h9cOtT9.png")
        .setColor(0x00AE86)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("Xuan Toc Do © 2018")
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("https://i.imgur.com/ZkoC0RM.png")
        .setTimestamp();
    embed.addField('Tác giả', 'Xuân Tóc Đỏ');
    embed.addField('Framework', 'DiscordJS');
    embed.addField('Nền Tảng', 'NodeJS');
    embed.addField("\u200B", 'Liên hệ Arita#4738 để báo lỗi!');
    return embed;
}