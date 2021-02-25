const Discord = require('discord.js');
const config = require("../config/config.json");
const axios = require("axios");

module.exports = function(client){

	var hi = ['', 'Hi', 'Hello', 'Sup', 'Yo', 'Whassup', '?'];
	client.on('message', async message => {
            return;
		let mentionUser = message.mentions.users.first();
		if(!mentionUser || mentionUser.id != client.user.id) return;
		let msgContent = message.content;
		msgContent = msgContent.replace(`<@!${mentionUser.id}>`, "").trim();
		if(msgContent == '') return message.channel.send(hi[Math.floor(Math.random() * (hi.length - 1)) + 1]);
		message.channel.startTyping();

            setTimeout(function(){
                  message.channel.stopTyping();
            }, 2000);

		axios.get('https://api.simsimi.net/v1/',{params:{text:msgContent, lang: "vi_VN"}})
      		.then( response =>{
      			message.channel.stopTyping();
      			let responseMsg = 'Em bị lỗi rồi';
                        console.log(response.data);
      			try {
                              let msg = response.data;
      				responseMsg = msg.messages[0].response;
      			} catch (e) {
      				return message.channel.send(responseMsg);
      			}
      			if(responseMsg.indexOf("http") == -1) {
        			return message.channel.send(responseMsg);
      			}
      			return message.channel.send('Hold up!');
      		})
		});
}