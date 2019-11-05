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
	if(greeting) {
		client.greet = greeting;
	} else {
		client.greet = {
			"message": "Xin chào :member!",
			"enable": true
		};
		let data = JSON.stringify(client.greet, null, 4);
    	fs.writeFileSync(`.${datDir}/greet.json`, data, 'utf8', 'w', (err) => {
	        if (err) {
	            console.log(err);
	        }
    	});
	}
	client.on('guildMemberAdd', async member => {
		if(!client.greet.enable) return; 
        let channel = await member.guild.channels.find(function(ch) {
            return ch.name === 'guests';
        });
        if(!channel) return;
        /*channel.send(`Xin chào ${member}. Đây là Discord của Guild Fury.`
        	+ '\nVui lòng DM Officer trong danh sách đang online hoặc mention **@Officer** để được invite vào Guild.'
        	+ '\nChúc bạn một ngày vui vẻ!');*/

        channel.send(client.greet.message.replace(":member", member));
    });
}