const Discord = require('discord.js');
const config = require("../config/config.json");

/* Greeting member when they join our guild */
const greetingChannel = 'guests';
module.exports = function(client, helper = null){

	client.on('guildMemberAdd', member => {
        let channel = member.guild.channels.find(function(ch) {
            return ch.name === 'guests';
        });
        channel.send(`Xin chào ${member}. Chúc bạn một ngày vui vẻ!`);
    });
}