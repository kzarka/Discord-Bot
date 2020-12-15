'use strict';
const fs = require("fs");
const guildsModel = require("../core/mongo/guilds.js");
const membersModel = require("../core/mongo/member.js");
const dependenciesDir = '/dependencies/'

module.exports = async function(client){
	await loadData(client);
	fs.readdir(`.${dependenciesDir}`, (err, files) => {
  		if (err) console.log(err);
  		console.log('\n----------------');
  		console.log('Loading dependencies...');
  		let loaded = 0;
  		files.forEach(file => {
	    	if (!file.endsWith(".js")) return;
	    	if(file.indexOf('init') !== -1) return;
	    	try {
	    		require(`..${dependenciesDir}${file}`)(client);
	    	} catch (e) {
	    		console.log(`Can not load file ${file}`);
	    		return;
	    	}
	    	loaded++;
		});
		console.log(`Loaded ${loaded}/${files.length-1} dependencies.`);
	});
}

async function loadData(client) {
	client.guildsModel = guildsModel;
    client.guildsData = await client.guildsModel.loadGuild();
    client.membersModel = membersModel;
    await client.membersModel.loadMemberByGuilds(client);
}