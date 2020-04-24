'use strict';

var modules = {
	description: 'Music module'
};

modules.member = function(client, message, args) {
	console.log(args);
	if(args.length == 0) return;
	let subCommand = args.shift();
	if(subCommand == 'info') {
		getUserData(client, message);
		return;
	}
	console.log(args);

	if(subCommand == 'list') {
		getAllUsers(client, message, args);
		return;
	}
};

function getUserData(client, message) {
	let user = message.mentions.users.first();
	if(!user) user = message.author;
	try {
		let userData = client.guildsData[message.guild.id].members[user.id];
		message.channel.send('```' 
			+ 'Thông Tin\nFamily/Character: ' 
			+ userData['family'] + '/' + userData['character'] 
			+ '\nClass: ' 
			+ userData['class']
			+ '\nLevel: ' 
			+ userData['level']
			+ '\nAP/AWK/DP: ' 
			+ userData['ap'] + '/' + userData['awk'] + '/' + userData['dp'] 
			+ '```');
	} catch {
		message.channel.send('Thành viên này chưa báo danh!');
	}
}

function getAllUsers(client, message, args) {
	let page = 0;
	let loadAll = false;
	if(args.length > 0) {
		if(args[0] == 'all') {
			loadAll = true;
		} else if(!isNaN(args[0])) {
			page = parseInt(args[0]);
		}
	}

	let userData = client.guildsData[message.guild.id].members;
	let total = Object.keys(userData).length;
	let totalPage = Math.ceil(total/10);
	if(totalPage == 0) totalPage = 1;
	if(page > totalPage) page = totalPage;
	if(page < 1) page = 1;
	
	buildListUser(userData, message, loadAll, page, totalPage);

}

function buildListUser(list, message, buildAll = true, page = 0, totalPage = 0) {
	let data = '```';
	let perPage = 10;
	let from = 10*page-10;
	let to = from + 10;
	let total = Object.keys(list).length;
	if(to > total) to = total;
	let index = 0;
	let header = `${'STT'.padEnd(3, ' ')} ${'Family/Character'.padEnd(35, ' ')} ${'Class'.padEnd(15, ' ')} ${'Level'.padEnd(10, ' ')} ${'AP/AWK/DP'.padEnd(18, ' ')} ${'Discord'}\n`;
	if(buildAll) {
		let data = '';
		for(let id in list) {
			if(index == 0) {
				data = '```' + header;
			} else if(index % 20 == 0 && index != total) {
				data += '```';
				message.channel.send(data);
				data = '```';
			}
			let user = message.guild.members.find(x => x.id === id);
			let info = list[id];
			index++;
			let stats = `${list[id].ap}/${list[id].awk}/${list[id].dp}`;
			let level = `${list[id].level}`;
			let familyInfo = `${list[id].family}/${list[id].character}`;
			let className = `${list[id].class}`;
			let discord = `${user.displayName}`;
			data += `${(index + '.').padEnd(3, ' ')} ${familyInfo.padEnd(35, ' ')} ${className.padEnd(15, ' ')} ${level.padEnd(10, ' ')} ${stats.padEnd(18, ' ')} ${discord}\n`;
			if (index == total) {
				data += '```';
				message.channel.send(data);
				return;
			}
		};
	} else {
		data += header;
		for(let id in list) {
			if(index++ < from - 1) {
				continue;
			}
			let user = message.guild.members.find(x => x.id === id);
			let info = list[id];
			let stats = `${list[id].ap}/${list[id].awk}/${list[id].dp}`;
			let level = `${list[id].level}`;
			let familyInfo = `${list[id].family}/${list[id].character}`;
			let className = `${list[id].class}`;
			let discord = `${user.displayName}`;
			data += `${(index + '.').padEnd(3, ' ')} ${familyInfo.padEnd(35, ' ')} ${className.padEnd(15, ' ')} ${level.padEnd(10, ' ')} ${stats.padEnd(18, ' ')} ${discord}\n`;
			if(index >= to) {
				break;
			}	
		};

		data += `Trang ${page}/${totalPage} | Tổng số ${total}`;
	}

	data += '```';
	message.channel.send(data);
}

module.exports = modules;