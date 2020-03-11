'use strict';

var modules = {
	description: 'Music module'
};

const dataDir = '/data/modules/setting/';

modules.info = function(client, message, args) {
	if(args.length == 0) return{
		message.channel.send(buildInfoEmbed(client, message));
	}
	if(!client.helper.isMe(message.author)) return;
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

function buildInfoEmbed(client, message) {
	const embed = new client.Discord.RichEmbed()
        //.setTitle("This is your title, it can hold 256 characters")
        //.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .setAuthor("Node War", "https://i.imgur.com/h9cOtT9.png")
        .setColor(0x00AE86)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By Xuan Toc Do", "https://i.imgur.com/h9cOtT9.png")
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("https://i.imgur.com/ZkoC0RM.png")
        .setTimestamp();
    embed.addField("\u200B", 'abc');
    embed.addBlankField(true);
}