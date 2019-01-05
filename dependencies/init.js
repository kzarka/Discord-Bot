'use strict';
const fs = require("fs");
const dependenciesDir = '/dependencies/'

module.exports = function(client){
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