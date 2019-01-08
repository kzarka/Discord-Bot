'use strict';

const dataDir = '/data/modules/enhance/';
const caphras  = require(`..${dataDir}caphras.json`);

let modules = {
	description: 'Music module',
	help: {}
};

modules.caphras = function(client, message, args) {
	if(args.length == 0) {
		return client.helper.sendHelpMessage(message, modules.help.caphras.default, true);
	}
	let subCommand = args.shift();
	if(subCommand == 'type') {
		return client.helper.sendHelpMessage(message, modules.help.caphras.list, true);
	}

	if(subCommand.toLowerCase() == 'tri' || subCommand.toLowerCase() == 'tet' || subCommand.toLowerCase() == 'pen') {
		if(args.length == 0) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.default, true);
		}
		let type = args.shift();
		if(!client.helper.isNormalInteger(type) || type == 0 || type > 10) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.wrongType, true);
		}
		let level = 1;
		if(args.length > 0) {
			level = args.shift();
		}
		if(!client.helper.isNormalInteger(level) || level == 0 || level > 20 ) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.overLevel, true);
		}
		let count = 0;
		if(level == 1) {
			count = caphras[type][subCommand.toUpperCase()][level-1];
		} else {
			count = caphras[type][subCommand.toUpperCase()][level-1] - caphras[type][subCommand.toUpperCase()][level-2];
		}
		return message.channel.send(`Stone cho **${subCommand.toUpperCase()} ${itemType[type]}** từ level ${level-1} đến level ${level} là ${count}`);
	}

	if(subCommand.toLowerCase() == 'count') {
		if(args.length == 0) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.default, true);
		}

		let enhanceLvl = args.shift();
		if(enhanceLvl.toLowerCase() != 'tri' && enhanceLvl.toLowerCase() != 'tet' && enhanceLvl.toLowerCase() == 'pen') {
			return client.helper.sendHelpMessage(message, modules.help.caphras.wrongEnhanceLvl, true);
		}
		if(args.length == 0) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.default, true);
		}
		let type = args.shift();
		if(!client.helper.isNormalInteger(type) || type == 0 || type > 10) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.wrongType, true);
		}
		let level = 1;
		if(args.length > 0) {
			level = args.shift();
		}
		if(!client.helper.isNormalInteger(level) || level == 0 || level > 20 ) {
			return client.helper.sendHelpMessage(message, modules.help.caphras.overLevel, true);
		}
		let sum = caphras[type][enhanceLvl.toUpperCase()][level-1];

		return message.channel.send(`Stone cần cho **${enhanceLvl.toUpperCase()} ${itemType[type]}** từ level 0 đến level ${level} là ${sum}`);
	}
};
/* Aliases for caphras */
modules.caph = modules.caphras;

modules.help = {
	"caphras": {
		"default": "Sử dụng: caphras|caph [TRI|TET|PEN] [Loại] [Level] để xem số caphras stone cần cho level tương ứng." +
		"\nĐể đếm số stone cần up từ level 0 đến level tương ứng sử dụng: caphras|caph [count] [TRI|TET|PEN] [Loại] [Level]" +
		"\nSử dụng caphras type để xem danh sách loại trang bị",

		"list": "Loại Trang Bị" +
		"\n1. Boss Mainhand" +
		"\n2. Boss Awaken" +
		"\n3. Vũ khí Blue Mainhand/Awaken" +
		"\n4. Vũ khí Green Mainhand/Awaken" +
		"\n5. Boss Offhand" +
		"\n6. Green Offhand" +
		"\n7. Boss Armor" +
		"\n8. Dim Tree Spirit Armor" +
		"\n9. Boss Mainhand" +
		"\n10. Green Armor",
		"wrongEnhanceLvl": "Sai định dạng. Cấp độ TRI, TET, PEN",
		"wrongType": "Sai định dạng. Loại trang bị từ 1-10",
		"overLevel": "Sai định dạng. Level từ 1-20"
	}
};

let itemType = {
	"1": "Boss Mainhand",
	"2": "Boss Awaken",
	"3": "Vũ khí Blue Mainhand/Awaken",
	"4": "Vũ khí Green Mainhand/Awaken",
	"5": "Boss Offhand",
	"6": "Green Offhand",
	"7": "Boss Armor",
	"8": "Dim Tree Spirit Armor",
	"9": "Boss Mainhand",
	"10": "Green Armor"
}
module.exports = modules;