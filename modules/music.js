'use strict';

var modules = {
	description: 'Music module'
};

modules.play = function(client, message, args) {
	message.channel.send('i play something');
};

modules.stop = function(client, message, args) {
	message.channel.send('i stop something');
};

modules.pause = function(client, message, args) {
	message.channel.send('i pause something');
};

module.exports = modules;