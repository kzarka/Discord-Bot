'use strict';

const caphras  = require('../data/enhance/caphras.json');

var modules = {
	description: 'Music module'
};

modules.caphras = function(client, message, args) {
	message.channel.send('i play something');
};

module.exports = modules;