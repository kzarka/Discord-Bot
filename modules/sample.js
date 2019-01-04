'use strict';

var modules = {
	description: 'Music module'
};

modules.play = function(client, message, args) {
	message.channel.send('i play something');
};

modules.get = function(client, message, args) {
	message.channel.send('i stop something');
};

modules.test = function(client, message, args) {
	message.channel.send('i pause something');
};

module.exports = modules;