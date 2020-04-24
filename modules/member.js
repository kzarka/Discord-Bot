'use strict';

var modules = {
	description: 'Music module'
};

modules.member = function(client, message, args) {
	if(args.length == 0) return;
	let subCommand = args.shift();
	if(subCommand == 'info') {
		getUserData(client, message);
		return;
	}

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
	if(args.length > 1) {
		if(args[0] == 'all') {
			loadAll = true;
		} else if(!isNaN(args[0])) {
			page = parseInt(args[0]);
		}
	}

	let userData = client.guildsData[message.guild.id].members;
	let total = Object.keys(userData).length;
	let totalPage = Math.floor(total/10);
	if(page > totalPage) page = totalPage;
	if(page < 1) page = 1;
	
	buildListUser(userData, message, loadAll, page);

}

function buildListUser(list, message, buildAll = true, page = 0) {
	let data = '```';
	let perPage = 10;
	let from = 10*page-10;
	let to = from + 9
	if(to > Object.keys(list).length) to = Object.keys(list).length;
	let index = 0;
	if(buildAll) {
		for(let id in list) {
			let user = message.guild.members.find(x => x.id === id);
			let info = list[id];
			console.log(user.displayName);
			console.log(info);
			data += `${++index}. ${list[id].family}/${list[id].character} Level:${list[id].level} Stats:${list[id].ap}/${list[id].awk}/${list[id].dp} Discord:${user.displayName}`;
		};
	} else {
		console.log(page);
		console.log(from, to);
		for(let id in list) {
			if(index++ < from) {
				console.log('continue');
				continue;
			}
			let user = message.guild.members.find(x => x.id === id);
			let info = list[id];
			console.log(user.displayName);
			console.log(info);
			data += `${index}. ${list[id].family}/${list[id].character} Level:${list[id].level} Stats:${list[id].ap}/${list[id].awk}/${list[id].dp} Discord:${user.displayName}\n`;
			if(index >= to) {
				break;
			}	
		};
	}
	data += '```';
	message.channel.send(data);
}

module.exports = modules;