const Discord = require('discord.js');
const config = require("../config/config.json");
const axios = require("axios");

module.exports = function(client){

	client.on('message', async message => {
		let mentionUser = message.mentions.users.first();
		if(!mentionUser || mentionUser.id != client.user.id) return;
		let msgContent = message.content;
		msgContent = msgContent.replace(`<@${mentionUser.id}>`, "");
		console.log(msgContent);
		axios.get('http://api.minhhieu.asia/vi.php',{params:{text:msgContent}})
      		.then( response =>{
        		message.channel.send(response.data);
      		})
		});
}