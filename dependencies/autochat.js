const Discord = require('discord.js');
const config = require("../config/config.json");
const axios = require("axios");

module.exports = function(client){

	var hi = ['', 'Hi', 'Hello', 'Sup', 'Yo', 'Whassup', '?'];
	client.on('message', async message => {
		let mentionUser = message.mentions.users.first();
		if(!mentionUser || mentionUser.id != client.user.id) return;
		let msgContent = message.content;
		msgContent = msgContent.replace(`<@${mentionUser.id}>`, "").trim();
		if(msgContent == '') return message.channel.send(hi[Math.floor(Math.random() * (hi.length - 1)) + 1])
		axios.get('http://api.minhhieu.asia/vi.php',{params:{text:msgContent}})
      		.then( response =>{
      			responseMsg = response.data;
      			if(responseMsg.indexOf("http") == -1) {
        			return message.channel.send(responseMsg);
      			}
      			return message.channel.send('Hold up!');
      		})
		});
}