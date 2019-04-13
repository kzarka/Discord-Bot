const Discord = require('discord.js');
const config = require("../config/config.json");

/* Greeting member when they join our guild */
const greetingChannel = 'guests';
module.exports = function(client){

	client.on('guildMemberAdd', member => {
        let channel = member.guild.channels.find(function(ch) {
            return ch.name === 'guests';
        });
        channel.send(`Xin chào ${member}. Đây là Discord của Guild Fury.`
        	+ '\nVui lòng DM Officer trong danh sách đang online hoặc mention **@Officer** để được invite vào Guild.'
        	+ '\nChúc bạn một ngày vui vẻ!');
    });
}