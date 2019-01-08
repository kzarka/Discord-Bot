'use strict';

const dataDir = '/data/modules/enhance/';

var modules = {
	description: 'IDK'
};

modules.heraku = function(client, message, args) {
	message.channel.send('i play something');
};

module.exports = modules;