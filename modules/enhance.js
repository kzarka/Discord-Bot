'use strict';

const dataDir = '/data/modules/enhance/';
const caphras  = require(`..${dataDir}caphras.json`);

var modules = {
	description: 'Music module'
};

modules.caphras = function(client, message, args) {
	message.channel.send('i play something');
};

module.exports = modules;