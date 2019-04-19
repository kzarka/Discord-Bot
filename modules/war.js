'use strict';
const fs = require("fs");
const Discord = require("discord.js");
const helper = require("../helper/war.js");

var modules = {
	description: 'War Module'
};
const datDir = '/data/dependencies/war';
const warVoteChannel = 'war-attendance';

const warStart = '20:00'
const warEnd = '21:00';

const maxDateWar = 7;

var channelWar = null;
// Global variable for member stats
modules.war = function(client, message, args) {

	try {
        channelWar = client.channels.find(x => x.name === warVoteChannel);
    } catch(e) {
        console.log(e)
    }
	if(args.length == 0) {
		message.channel.send('Sử dụng `war off [dd/mm/yyyy]` để kích hoạt vote war!');
		return;
	}
	if(args[0] == 'on') {
		if(client.war.war == true) {
			message.channel.send('War đã mở từ trước');
			return;
		}
		if(!args[1]) {
			message.channel.send('Sử dụng `war off [dd/mm/yyyy]` để kích hoạt vote war!');
			return;
		}
		client.war.war = true;
		client.war.node = args[1] || null;
		client.war.message = args[2] || null;
		let data = {
			"inwar": true,
			"node": client.war.node,
			"message": client.war.message
		}
		data = JSON.stringify(data, null, 4);
        fs.writeFileSync(`.${datDir}/war.json`, data, 'utf8', 'w', (err) => {
            if (err) {
                console.log(err);
            }
        });
        helper.reloadTopMessage(channelWar, client);
        message.channel.send('Đã khởi động war!');
		return;
	}
	if(args[0] == 'off') {
		if(client.war.war == false) {
			message.channel.send('War hiện không mở');
			return;
		}
		message.channel.send('Mọi dữ liệu vote sẽ mất, gõ yes để xác nhận!');
		const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.on('collect', message => {
            if (message.content == "yes") {
            	client.war.war = false
                client.war.joined = [];
            	let data = {
					"inwar": false
				}
				data = JSON.stringify(data, null, 4);
		        fs.writeFileSync(`.${datDir}/war.json`, data, 'utf8', 'w', (err) => {
		            if (err) {
		                console.log(err);
		            }
		        });
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

function inWarTime() {
	let now = Date.now();
    if(now >= hourToDay(warStart).getTime() && now <= hourToDay(warEnd).getTime()) {
    	return true;
    }
    return false;
}

function validDate(date) {
	date = date.trim();
	var pattern = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
	// if passes basic test
	if(!pattern.test(date)) return false;
	let items = date.split('/');
	let now = new Date();
	let inputDate = parseInt(items[0]);
	let inputMonth = parseInt(items[1]) - 1;
	let inputYear = parseInt(items[2]);
	if(inputYear != now.getFullYear()) return false;
	let desireDate = new Date(inputYear, inputMonth, inputDate);
	// if desire greater than 7 days from now return
	if((now.getTime() - desireDate.getTime()) >= 7*24*3600*1000) return false;
	console.log('pass3')
	// if enable war in current day after war time return
	if((now.getDate() == desireDate.getDate()) && (now.getMonth() == desireDate.getMonth())) {
		console.log('about pass 4')
		let endWarTime = new Date(inputYear, inputMonth, inputDate, 16);
		if(endWarTime.getTime() <= now.getTime()) return false;
	}
	return `${desireDate.getDate()}/${desireDate.getMonth() + 1}/${desireDate.getFullYear()}`;
}