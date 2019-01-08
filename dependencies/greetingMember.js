const Discord = require('discord.js');
const config = require("../config/config.json");

/* Greeting member when they join our guild */
const greetingChannel = 'guests';
module.exports = function(client, helper = null){

	client.on('guildMemberAdd', member => {
        let channel = guild.channels.find(function(ch) {
            return ch.name === 'guests' || ch.name === 'welcome';
        });
        channel.send(`Xin chào ${member}. Đây là kênh Discord của Guild Fury\n
        Nếu bạn đã vào Guild vui lòng liên hệ Officer hoặc comment tại đây tên nhân vật và class đang chơi.\n
        Nếu bạn chưa vào guild thì cũng liên hệ officer hoặc comment ở đây để được hướng dẫn vào Guild.\n
        Chúc bạn một ngày vui vẻ!`);
    });
}