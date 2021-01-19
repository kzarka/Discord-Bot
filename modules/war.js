'use strict';
const Discord = require("discord.js");
const helper = require("../helper/war.js");

var modules = {
	description: 'War Module'
};
const datDir = '/data/dependencies/war';
const warVoteChannel = 'war-attendance';

var channelWar = null;
// Global variable for member stats
modules.war = async function(client, message, args) {
	let guildId = message.guild.id;
	try {
        channelWar = message.guild.channels.cache.find(x => x.name === warVoteChannel);
    } catch(e) {
        console.log(e)
    }
    if(!channelWar) {
    	message.channel.send("You don't have a channel for war voting");
		return;
    }
	if(args.length == 0) {
		message.channel.send('Use command `war on [dd/mm/yyyy]` to schedule next war!');
		return;
	}
	if(args[0] == 'on') {
		if(helper.isWarOpen(client, guildId) == true) {
			let embed = await helper.buildEmbedInfo(client, guildId);
			message.channel.send('Already open', embed);
			return;
		}
		if(!args[1]) {
			message.channel.send('Use command `war on [dd/mm/yyyy]` to schedule next war!');
			return;
		}
		let warDate = helper.validDate(args[1]);
		if(!warDate) {
			message.channel.send("Sử dụng `war on [dd/mm/yyyy]` to schedule next war!\nDate must not greater than 7 days from now on\nCan not set war after 22h at the same day");
			return;
		}
		// save to file json
		await helper.saveWarInfo(client, guildId, warDate);
		// reload top msg
        await helper.reloadTopMessage(client, guildId);
        // for auto shutdown war
        helper.warAutoShutdown(client, guildId);
       	let embed = await helper.buildEmbedInfo(client, guildId);
		message.channel.send('Setting saved!', embed);
		return;
	}
	if(args[0] == 'set') {
		if(helper.isWarOpen(client, guildId) == false) {
			message.channel.send('War hiện không mở');
			return;
		}
		if(!args[1]) {
			message.channel.send('Sử dụng `war set [node/message] [string]` để cài đặt thuộc tính!');
			return;
		}
		if(args[1] == 'node') {
			if(!args[2]) {
				message.channel.send('Sử dụng `war node [node]` để set node!');
				return;
			}
			let nodeName = '';
			for(let i = 2; i < args.length; i++){
				nodeName += ' ' + args[i];
			}
			if(nodeName.length > 60) {
				message.channel.send('Tên Node quá dài!');
				return;
			}
			await helper.updateWar(client, guildId, null, nodeName.trim());
			message.channel.send(`Đã lưu Node thành công. Node ${nodeName.trim()}!`);
			await helper.reloadTopMessage(client, guildId);
			return;
		}
		// set message
		if(args[1] == 'message') {
			if(!args[2]) {
				message.channel.send('Sử dụng `war message [message]` để set tin nhắn!');
				return;
			}
			let messageContent = '';
			for(let i = 2; i < args.length; i++){
				messageContent += ' ' + args[i];
			}
			if(messageContent.length > 200) {
				message.channel.send('Nội dung quá dài, tối đã 200 ký tự!');
				return;
			}
			await helper.updateWar(client, guildId, null, null, messageContent.trim());
			message.channel.send(`Đã lưu tin nhắn thành công\nNội dung: ${messageContent.trim()}!`);
			await helper.reloadTopMessage(client, guildId);
			return;
		}
	}
	if(args[0] == 'off') {
		console.log(guildId);
		if(helper.isWarOpen(client, guildId) == false) {
			message.channel.send('No war scheduled');
			return;
		}
		message.channel.send('Do you want to disable this war vote?');
		let requestUserId = message.author.id;
		const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.on('collect', message => {
        	if(message.author.bot) return;
        	if(message.author.id != requestUserId) return;
            if (message.content == "yes") {
				// save to file json
				helper.disableWar(client, message.guild.id);
		        //helper.reloadTopMessage(channelWar, client);
                message.channel.send("War has been canceled!");
            }
        })
	}

};

module.exports = modules;

function hourToDay(hour){
    var day = new Date();
    h = parseInt(hour.split(':')[0]);
    m = parseInt(hour.split(':')[1]);
    day.setHours(h);
    day.setMinutes(m);
    return day;
}
