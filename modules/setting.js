'use strict';

var modules = {
	description: 'Music module'
};

const dataDir = '/data/modules/setting/';

modules.set = function(client, message, args) {
	if(args.length == 0) return;
	if(args[0] == 'channel') {
		client.
		message.channel.send('Được chọn là channel chính.');
	}
};

module.exports = modules;