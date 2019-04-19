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
modules.war = function(client, message, args) {

	try {
        channelWar = client.channels.find(x => x.name === warVoteChannel);
    } catch(e) {
        console.log(e)
    }
	if(args.length == 0) {
		message.channel.send('Sử dụng `war on [dd/mm/yyyy]` để kích hoạt vote war!');
		return;
	}
	if(args[0] == 'on') {
		if(client.war.war == true) {
			message.channel.send('War đã mở từ trước');
			return;
		}
		if(!args[1]) {
			message.channel.send('Sử dụng `war on [dd/mm/yyyy]` để kích hoạt vote war!');
			return;
		}
		let warDate = helper.validDate(args[1]);
		if(!warDate) {
			message.channel.send('Sử dụng `war on [dd/mm/yyyy]` để kích hoạt vote war!\nNgày war không lớn hơn 7 ngày từ thời điểm hiện tại\nKhông thể set war sau 22h cùng ngày.');
			return;
		}
		client.war.war = true;
		client.war.date = warDate;
		client.war.joined = [];
		// save to file json
		helper.saveWarInfo(client, datDir);
		// reload top msg
        helper.reloadTopMessage(channelWar, client);
        // for auto shutdown war
        helper.warAutoShutdown(client);
        message.channel.send('```Đã lưu cài đặt!\nWar kế tiếp: 20:00 ' 
        	+ client.war.date + `!\nNode: ${client.war.node || 'TBD'}`
        	+ `\nMessage: ${client.war.message || ''}` + '```');
		return;
	}
	if(args[0] == 'set') {
		if(client.war.war == false) {
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
			client.war.node = nodeName.trim();
			helper.saveWarInfo(client, datDir);
			message.channel.send(`Đã lưu Node thành công. Node ${client.war.node}!`);
			helper.reloadTopMessage(channelWar, client);
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
			client.war.message = messageContent.trim();
			helper.saveWarInfo(client, datDir);
			message.channel.send(`Đã lưu tin nhắn thành công\nNội dung: ${client.war.message}!`);
			helper.reloadTopMessage(channelWar, client);
			return;
		}
	}
	if(args[0] == 'off') {
		if(client.war.war == false) {
			message.channel.send('War hiện không mở');
			return;
		}
		message.channel.send('Mọi dữ liệu vote sẽ mất, gõ yes để xác nhận!');
		let requestUserId = message.author.id;
		const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.on('collect', message => {
        	if(message.author.bot) return;
        	if(message.author.id != requestUserId) return;
            if (message.content == "yes") {
				client.war = {
            		"war": false
            	}
				// save to file json
				helper.saveWarInfo(client, datDir);
		        helper.reloadTopMessage(channelWar, client);
                message.channel.send("Đã hủy bỏ war!");
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
