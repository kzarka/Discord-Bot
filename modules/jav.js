'use strict';
const axios = require("axios");

var modules = {
	description: 'Music module'
};

modules.search = function(client, message, args) {
	axios.get('https://jav-rest-api-htpvmrzjet.now.sh/api/actress',{params:{name:msgContent}})
  		.then( response =>{
  			let responseMsg = 'Em bị lỗi rồi';
  			try {
  				responseMsg = response.data;
  			} catch (e) {
  				return message.channel.send(responseMsg);
  			}
  			if(responseMsg.indexOf("http") == -1) {
    			return message.channel.send(responseMsg);
  			}
  			return message.channel.send('Hold up!');
  		})
};

modules.get = function(client, message, args) {
	message.channel.send('i stop something');
};

modules.test = function(client, message, args) {
	message.channel.send('i pause something');
};

module.exports = modules;