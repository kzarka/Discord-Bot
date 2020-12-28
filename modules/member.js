'use strict';
const Discord = require("discord.js");

var modules = {
	description: 'Music module'
};

const Canvas = require('canvas');

const dataDir = '/data/modules/member/';

modules.member = async function(client, message, args) {
	console.log(args);
	if(args.length == 0) return;
	let subCommand = args.shift();
	if(subCommand == 'info') {
		await getUserData(client, message);
		return;
	}

	if(subCommand == 'list') {
		getAllUsers(client, message, args);
		return;
	}
};

async function getUserData(client, message) {
	let user = message.mentions.members.first();
	if(!user) user = message.member;

	try {
		let userData = client.guildsData[message.guild.id].members[user.id];
		let attachment = await drawImage(message.member, userData);
		message.channel.send(attachment);
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
	let header = `${'STT'.padEnd(3, ' ')} ${'Family/Character'.padEnd(35, ' ')} ${'Class'.padEnd(15, ' ')} ${'Level'.padEnd(10, ' ')} ${'AP/AWK/DP'.padEnd(18, ' ')} ${'Discord'}\n\n`;
	if(buildAll) {
		let data = '';
		let id = null;
		for(id in list) {
			if(index == 0) {
				data = '```' + header;
			} else if(index % 15 == 0 && index != total) {
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
		let id = null;
		for(id in list) {
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

		data += `\nTrang ${page}/${totalPage} | Tổng số ${total}`;
	}

	data += '```';
	message.channel.send(data);
}

module.exports = modules;

async function drawImage(member, userData) {
	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('.' + dataDir + 'background.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	// Slightly smaller text placed above the member's display name
	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`${member.user.tag}:`, canvas.width / 2.5, canvas.height / 2.5);

	// Add an exclamation point here and below
	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`Class: ${userData.class}\nFamily/Character: ${userData.family}/${userData.character}\nLevel: ${userData.level}`, canvas.width / 2.5, canvas.height / 1.8);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	console.log(member.user);
	const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

	return attachment;
}

const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};