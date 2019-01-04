'use strict';

module.exports = (client, message, args) => {
	const command = args.shift().toLowerCase();
	if (command == 'load') {
		let moduleName = args.shift().toLowerCase();
	}
};