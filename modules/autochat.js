'use strict';

const dataDir = '/data/modules/message/';
const axios = require("axios");

var modules = {
	description: 'Edit message'
};

modules.autochat = function(client, message, args) {
	let mentionUser = message.mentions.users.first();
	if(!mentionUser || mentionUser.id != client.user.id) return;
	console.log(message.content);
};

module.exports = modules;