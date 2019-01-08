'use strict';
const modules = require("../config/modules.json");
const commands = require("../config/commands.json");
const helper = require("../core/helper");
const fs = require("fs");
const Enmap = require("enmap");

const modulesDir = '/modules/';

var core = {
	modules: {
		total: 0,
		loaded: 0
	},
	commands: {
		total: 0,
		active: 0
	}

};

core.bootstrap = function(client, message, args) {
	if (message.author.id != '213722448070180864') return;
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

	if(command == 'command' || command == 'cmd'){
		if (copyArgs.length == 0) {
			helper.logInfo('Missing parameter!', message);
			return;
		}
		let subCommand = copyArgs.shift().toLowerCase();
		if (subCommand == 'enable') {
			if (copyArgs.length == 0) {
				helper.logInfo('Missing command name!', message);
				return;
			}
			let commandName = copyArgs.shift().toLowerCase();
			this.loadCommand(commandName, client, message);
		}

		if (subCommand == 'disable') {
			if (copyArgs.length == 0) {
				helper.logInfo('Missing command name!', message);
				return;
			}
			let commandName = copyArgs.shift().toLowerCase();
			this.unloadCommand(commandName, client, message);
		}
		
	}
};
core.loadAll = function(client, reload = false) {
	if(reload) {
		client.modules = new Enmap();
		client.commands = new Enmap();
	}
	helper.logInfo(`Loading active modules...`);
	new Promise((resolve, reject) => {
		fs.readdir(`.${modulesDir}`, (err, files) => {
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
		helper.logInfo(`Found ${this.commands.active} commands active in total ${this.commands.total} commands`);
		helper.saveConfig(fs, client);
	});
};

core.load = function(moduleName, client, message = null) {
	if (client.modules.get(moduleName)) {
		helper.logInfo(`Modules ${moduleName} has already been loaded`, message);
		return true;
	}
	var modulePath = (`..${modulesDir}` + moduleName);
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
    	console.log(e);
        helper.logInfo(`Modules ${moduleName} cant be load`, message);
        return false;
    }

    let listCommands = Object.getOwnPropertyNames(props).filter(function (p) {
	    return typeof props[p] === 'function';
	});
	// if message null then this is first load
	if(!message) {
		this.commands.total += listCommands.length;
	}
    // remove previous commands
	client.commands = client.commands.filter(function (cmd) {
		return client.commands.get(cmd) != moduleName;
	});
	// add it back
	let result = listCommands.every(function(cmd, index) {
		if(message) {
			let module = client.commands.get(cmd);
			if(module && module != moduleName) {
				helper.logInfo(`Modules ${moduleName} cant be load, duplicate command ${cmd}, please try again!`, message);
				return false;
			}
		}
		
		if(!message && commands[cmd] != void(0)) {
			client.commands.set(cmd, moduleName);
		} else if(message) {
			client.commands.set(cmd, moduleName);
		}
		return true;
	});

	if(!result) {
		return;
	}

	client.modules.set(moduleName, props);
    
    if(message) {
    	helper.logInfo(`Modules ${moduleName} has been loaded with ${listCommands.length} commands`, message);
    	helper.saveConfig(fs, client);
    }
    this.commands.active = client.commands.keyArray().length;
    return true;
};

core.reload = function(moduleName, client, message = null) {

	var modulePath = (`..${modulesDir}` + moduleName);
	// See if module file exists
    try {
        var resolvedModulePath = require.resolve(modulePath);
    } catch (e) {
        helper.logInfo(`Modules ${moduleName} not found`, message);
        return false;
    }

    // Force remove module from require cache, so we can re-parse the file
    delete require.cache[resolvedModulePath];

   	if (client.modules.get(moduleName)) {
   		client.modules.remove(moduleName);
   	}

    // Load it
    this.load(moduleName, client);

    helper.logInfo(`Modules ${moduleName} has been reloaded`,message);
    helper.saveConfig(fs, client);
    return true;
};

core.unload = function(moduleName, client, message = null) {
	if (!client.modules.get(moduleName)) {
		helper.logInfo(`Modules ${moduleName} didnt loaded`, message);
		return true;
	}
	var modulePath = (`..${modulesDir}` + moduleName);
	// See if module file exists
    try {
        var resolvedModulePath = require.resolve(modulePath);
    } catch (e) {
        helper.logInfo(`Modules ${moduleName} not found`, message);
        return false;
    }

    // Force remove module from require cache, so we can re-parse the file
    delete require.cache[resolvedModulePath];
    // remove previous commands
	client.commands = client.commands.filter(function (cmd) {
		return client.commands.get(cmd) != moduleName;
	});

    client.modules.delete(moduleName);
    helper.logInfo(`Modules ${moduleName} has been unloaded`, message);
    helper.saveConfig(fs, client);
    return true;
};

core.loadCommand = function(commandName, client, message) {
	if(client.commands.get(commandName)) {
		helper.logInfo(`Commands ${commandName} has already been loaded`, message);
		return true;
	}
	let module = client.modules.findKey(val => val[commandName] != void(0));
	if(module) {
		client.commands.set(commandName, module);
		helper.saveConfig(fs, client);
		helper.logInfo(`Commands ${commandName} has been loaded`, message);
		return;
	} else {
		helper.logInfo(`Commands ${commandName} not found`, message);
		return;
	}
	
};

core.unloadCommand = function(commandName, client, message) {
	if(!client.commands.get(commandName)) {
		helper.logInfo(`Commands ${commandName} didnt load`, message);
		return true;
	}
	let module = client.modules.findKey(val => val[commandName] != void(0));
	if(module) {
		if(!client.commands.get(commandName)) {
			helper.logInfo(`Commands ${commandName} didnt load`, message);
			return true;
		}
		client.commands.delete(commandName);
		helper.logInfo(`Commands ${commandName} disabled`, message);
		helper.saveConfig(fs, client);
		return;
	} else {
		helper.logInfo(`Commands ${commandName} not found`, message);
		return;
	}
	
};


module.exports = core;