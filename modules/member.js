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
	if(subCommand == 'card') {
		await getUserData(client, message);
		return;
	}

	if(subCommand == 'gear') {
		await getUserData(client, message, true);
		return;
	}

	if(subCommand == 'list') {
		getAllUsers(client, message, args);
		return;
	}
};

async function getUserData(client, message, withImage = false) {
	let user = message.mentions.members.first();
	if(!user) user = message.member;

	try {
		let userData = client.guildsData[message.guild.id].members[user.id];
		if(!userData) throw 'E';
		let attachment = await drawImage(user, userData);
		let gearImg = userData.image;
		if(gearImg && badgeOnly) {
			message.channel.send(attachment);
			message.channel.send({files: [gearImg]});
			return;
		}
		message.channel.send(attachment);
	} catch(e) {
		console.log(e);
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
	console.log(userData);
	const canvas = Canvas.createCanvas(857, 238);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage(getClassBg(userData.class));
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	let memberTag = member.user.tag;
	let memberName = memberTag.split('#')[0];
	let memberId = '#' + memberTag.split('#')[1];

	//ctx.fillStyle = "rgba(240, 238, 246, 0.7)";
	roundRect(ctx, 240, 80, 600, 120, 5, "rgba(9, 10, 11, 0.8)");

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#62d3f5';
	ctx.fillText(`FAMILY `, 250, 110);

	ctx.font = '25px Roboto';
	ctx.fillStyle = 'white';
	ctx.fillText(`${userData.family}`, 360, 110);

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#62d3f5';
	ctx.fillText(`CHARACTER `, 250, 145);

	ctx.font = '25px Roboto';
	ctx.fillStyle = 'white';
	ctx.fillText(`${userData.character}`, 360, 145);

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#62d3f5';
	ctx.fillText(`GEAR `, 250, 185);

	ctx.font = '25px Roboto';
	ctx.fillStyle = 'white';
	ctx.fillText(`${userData.ap}/${userData.awk}/${userData.dp}`, 360, 185);

	//ctx.strokeStyle = 'black';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	// RANK SECTION
	roundRect(ctx, 240, 30, 600, 40, 5, "rgba(9, 10, 11, 0.9)");

	ctx.font = '28px Roboto';
	ctx.fillStyle = '#62d3f5';
	let lengthName = ctx.measureText(memberName).width;

	ctx.fillText(`${memberName}`, 250, 60);

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#7f8384';
	let lengthName2 = ctx.measureText(memberId).width;
	ctx.fillText(`${memberId}`, 250+lengthName, 60);
	
	lengthName = lengthName+lengthName2 + 20;

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#62d3f5';
	lengthName2 = ctx.measureText('LEVEL').width;
	ctx.fillText(`LEVEL `, 250+lengthName, 60);

	lengthName = lengthName+lengthName2;

	ctx.font = '28px Roboto';
	ctx.fillStyle = 'white';
	ctx.fillText(`${userData.level}`, 250+lengthName, 60);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	let avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
	//let avatar = await Canvas.loadImage('https://cdn.discordapp.com/avatars/213722448070180864/187bbc9ae2f6538f03a641f12596bf3c.png');
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'member-info.png');

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

function getClassBg(className) {
	if(!className) return '.' + dataDir + 'background.png';
	console.log('./images/classes/' + className.toLowerCase().replace(' ', '_') + '.jpg');
	return './images/classes/' + className.toLowerCase().replace(' ', '_') + '.jpg';
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (var side in defaultRadius) {
	  		radius[side] = radius[side] || defaultRadius[side];
		}
	}

	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
		ctx.fillStyle = fill;
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}

}