'use strict';

const dataDir = '/data/modules/horse/';
const level  = require(`..${dataDir}level.json`);

var modules = {
	description: 'Horse module'
};

modules.horse = function(client, message, args) {
	
};

module.exports = modules;