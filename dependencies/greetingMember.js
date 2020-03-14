const Discord = require('discord.js');
const config = require("../config/config.json");
const fs = require("fs");

/* Greeting member when they join our guild */
const greetingChannel = 'guests';

const datDir = '/data/dependencies/greet';

var greeting = null;
try {
	greeting =  require(`..${datDir}/greet.json`);
} catch (e) {
	console.log('Its first start obviously');
}

module.exports = function(client){

	client.on('guildMemberAdd', async member => {
		if(!client.guildsData[member.guild.id].welcome_enable) return;
		if(!client.guildsData[member.guild.id].welcome_message) return;
        let channel = client.helper.getGuestChannel(client, member.guild);
        if(!channel) return;
        let welcome_message = client.guildsData[member.guild.id].welcome_message;
        /*channel.send(`Xin chào ${member}. Đây là Discord của Guild Fury.`
        	+ '\nVui lòng DM Officer trong danh sách đang online hoặc mention **@Officer** để được invite vào Guild.'
        	+ '\nChúc bạn một ngày vui vẻ!');*/

        channel.send(welcome_message.replace(":member", member));
    });
}