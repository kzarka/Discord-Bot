'use strict';
const modules = require("../config/modules.json");
const helper = require("../core/helper");
const fs = require("fs");
const Enmap = require("enmap");

var core = {
	modules: {
		total: 0,
		loaded: 0
	},
	commands: {
		total: 0,
		loaded: 0
	}

};

core.bootstrap = function(client, message, args) {
	let copyArgs = args.slice();
	const command = copyArgs.shift().toLowerCase();
	if (command == 'load') {
		if (copyArgs.length == 0) {
			helper.logInfo('Missing module name!', message);
			return;
		}
		let moduleName = copyArgs.shift().toLowerCase();
		this.load(moduleName, client, message);
	}

	if (command == 'reload') {
		if (copyArgs.length == 0) {
			helper.logInfo('Missing module name!', message);
			return;
		}
		let moduleName = copyArgs.shift().toLowerCase();
		if (moduleName == '--all') {
			this.loadAll(client, true);
			helper.logInfo('Trying to reload all modules!', message);
			helper.logInfo(`Loaded ${this.modules.loaded} in total ${this.modules.total} modules`, message);
			return;
		}
		this.reload(moduleName, client, message);
	}

	if (command == 'unload') {
		if (copyArgs.length == 0) {
			helper.logInfo('Missing module name!', message);
			return;
		}
		let moduleName = copyArgs.shift().toLowerCase();
		this.unload(moduleName, client, message);
	}
};
core.loadAll = function(client, reload = false) {
	if(reload) {
		client.modules = new Enmap();
	}
	helper.logInfo(`Loading active modules...`);
	new Promise((resolve, reject) => {
		fs.readdir("./modules/", (err, files) => {
	  		if (err) console.log(err);
	  		files.forEach(file => {
		    	if (!file.endsWith(".js")) return;
		    	this.modules.total++;
			});
			for(let item in modules) {
				if(modules[item] == 0) continue;
				if (this.load(item, client)) {
					this.modules.loaded++;
				}
			};
			resolve();
		});
		
	}).then(() => {
		helper.logInfo(`Loaded ${this.modules.loaded} in total ${this.modules.total} modules`);
	});
};

core.load = function(moduleName, client, message = null) {
	if (client.modules.get(moduleName)) {
		helper.logInfo(message, `Modules ${moduleName} has already been loaded`);
		return true;
	}
	var modulePath = ('../modules/' + moduleName);
	// See if module file exists
    try {
        var resolvedModulePath = require.resolve(modulePath);
    } catch (e) {
        helper.logInfo(`Modules ${moduleName} not found`, message);
        return false;
    }

    // Force remove module from require cache, so we can re-parse the file
    delete require.cache[resolvedModulePath];

    // Parse it
    try {
        var props = require(modulePath);
    } catch (e) {
        helper.logInfo(message, `Modules ${moduleName} cant be load`);
        return false;
    }

    let listCommands = Object.getOwnPropertyNames(props).filter(function (p) {
	    return typeof props[p] === 'function';
	});
	console.log(listCommands);

	listCommands.forEach(cmd => {
		let fnc = props[cmd];
		console.log(fnc);
		//client.modules.set(cmd, fnc);
		
	});
	client.modules.set(moduleName, props);
    
    if(message) {
    	helper.logInfo(`Modules ${moduleName} has been loaded with ${listCommands.length} commands`, message);
    }
    return true;
};

core.reload = function(moduleName, client, message = null) {

	var modulePath = ('./modules/' + moduleName);
	// See if module file exists
    try {
        var resolvedModulePath = require.resolve(modulePath);
    } catch (e) {
        helper.logInfo(`Modules ${moduleName} not found`, message);
        return false;
    }

    // Force remove module from require cache, so we can re-parse the file
    delete require.cache[resolvedModulePath];

    // Parse it
    try {
        var props = require(modulePath);
    } catch (e) {
        helper.logInfo(message, `Modules ${moduleName} cant be load`);
        return false;
    }

    client.modules.set(moduleName, props);
    helper.logInfo(message, `Modules ${moduleName} has been reloaded`);
    return true;
};

core.unload = function(moduleName, client, message = null) {
	if (!client.modules.get(moduleName)) {
		helper.logInfo(message, `Modules ${moduleName} didnt loaded`);
		return true;
	}
	var modulePath = ('./modules/' + moduleName);
	// See if module file exists
    try {
        var resolvedModulePath = require.resolve(modulePath);
    } catch (e) {
        helper.logInfo(`Modules ${moduleName} not found`, message);
        return false;
    }

    // Force remove module from require cache, so we can re-parse the file
    delete require.cache[resolvedModulePath];

    client.modules.deleteProp(moduleName);
    helper.logInfo(message, `Modules ${moduleName} has been unloaded`);
    return true;
};


module.exports = core;