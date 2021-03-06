'use strict';
const Discord = require("discord.js");
const participateModel = require("../core/mongo/war_participates.js");
const memberModel = require("../core/mongo/member.js");

var modules = {
	description: 'Music module'
};
const warHelper = require("../helper/war.js");

const Canvas = require('canvas');

const dataDir = '/data/modules/member/';

modules.member = async function(client, message, args) {
	if(args.length == 0) return;
	let subCommand = args.shift();
	if(subCommand == 'card') {
		await getUserData(client, message, args);
		return;
	}

	if(subCommand == 'gear') {
		await getUserData(client, message, args, true);
		return;
	}

	if(subCommand == 'list') {
		if(!client.helper.canManage(message)) {
			message.channel.send('Bạn không có quyền thực hiện lệnh này!');
			return;
		}
		getAllUsers(client, message, args);
		return;
	}

	if(subCommand == 'warlog') {
		getMemberWar(client, message, args);
		return;
	}

	if(subCommand == 'remove') {
		if(!client.helper.canManage(message)) {
			message.channel.send('Bạn không có quyền thực hiện lệnh này!');
			return;
		}
		removeMember(client, message, args);
		return;
	}

	if(subCommand == 'add') {
		if(!client.helper.canManage(message)) {
			message.channel.send('Bạn không có quyền thực hiện lệnh này!');
			return;
		}
		addMember(client, message, args);
		return;
	}
};

async function getUserData(client, message, args, withImage = false) {
	let user = await getMemberFromArgs(message, args);

	if(!user) user = message.mentions.members.first();
	if(!user) user = message.member;
	try {
		let userData = client.guildsData[message.guild.id].members[user.id];
		if(!userData) throw 'E';
		let attachment = await drawImage(user, userData);
		let gearImg = userData.image;
		if(gearImg && withImage) {
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
	let page = 1;
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
	if(!page) page = 1;
	
	buildListUser(userData, message, loadAll, page, totalPage);

}

async function buildListUser(list, message, buildAll = true, page = 0, totalPage = 0) {
	let withWarCount = await participateModel.fetchWarMemberCountByGuildId(message.guild.id);
	let data = '```';
	let perPage = 10;
	let from = 10*page-10;
	let to = from + 10;
	let total = Object.keys(list).length;
	if(to > total) to = total;
	let index = 0;
	let header = `${'STT'.padEnd(3, ' ')} ${'Family/Character'.padEnd(35, ' ')} ${'Node War'.padEnd(10, ' ')} ${'Class'.padEnd(15, ' ')} ${'Level'.padEnd(10, ' ')} ${'AP/AWK/DP'.padEnd(18, ' ')} ${'Discord'}\n\n`;
	if(buildAll) {
		let data = '';
		let id = null;
		for(id in list) {
			let user = message.guild.members.cache.find(x => x.id === id);
			
			if(index == 0) {
				data = '```' + header;
			} else if(index % 15 == 0 && index != total) {
				data += '```';
				message.channel.send(data);
				data = '```';
			}

			let info = list[id];
			index++;
			let stats = `${list[id].ap || '--'}/${list[id].awk || '--'}/${list[id].dp || '--'}`;
			let level = `${list[id].level || '--'}`;
			let familyInfo = `${list[id].family || '---'}/${list[id].character || '---'}`;
			let className = `${list[id].class || '---'}`;
			let discord = id;
			if(user) {
				discord = `${user.user.tag}`;
			}
			let warCount = withWarCount[id];
			if(!warCount) warCount = 0;
			warCount = warCount + '';
			data += `${(index + '.').padEnd(3, ' ')} ${familyInfo.padEnd(35, ' ')} ${warCount.padEnd(10, ' ')} ${className.padEnd(15, ' ')} ${level.padEnd(10, ' ')} ${stats.padEnd(18, ' ')} ${discord}\n`;
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
			let user = message.guild.members.cache.find(x => x.id === id);
			if(index++ < from - 1) {
				continue;
			}
			let info = list[id];
			let stats = `${list[id].ap || '--'}/${list[id].awk || '--'}/${list[id].dp || '--'}`;
			let level = `${list[id].level || '--'}`;
			let familyInfo = `${list[id].family || '---'}/${list[id].character || '---'}`;
			let className = `${list[id].class || '---'}`;
			let discord = id;
			if(user) {
				discord = `${user.user.tag}`;
			}
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
	let width = 857;
	let height = 238;
	let x = 0;
	let y = 0;
	const canvas = Canvas.createCanvas(857, 238);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage(getClassBg(userData.class));
	ctx.beginPath();
	let radius = 20;
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	ctx.clip();

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
	ctx.fillText(`${userData.family || '---'}`, 360, 110);

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#62d3f5';
	ctx.fillText(`CHARACTER `, 250, 145);

	ctx.font = '25px Roboto';
	ctx.fillStyle = 'white';
	ctx.fillText(`${userData.character || '---'}`, 360, 145);

	ctx.font = '16px Roboto';
	ctx.fillStyle = '#62d3f5';
	ctx.fillText(`GEAR `, 250, 185);

	ctx.font = '25px Roboto';
	ctx.fillStyle = 'white';
	ctx.fillText(`${userData.ap || '--'}/${userData.awk || '--'}/${userData.dp || '--'}`, 360, 185);

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
	ctx.fillText(`${userData.level || '--'}`, 250+lengthName, 60);

	// COPY RIGHT SECTION
	ctx.font = 'bold 11px Roboto';
	ctx.fillStyle = '#fff';
	ctx.fillText(`© Xuan Bot`, width-90, height-15);

	// DRAW AVATAR

	ctx.beginPath();
	ctx.arc(115, 115, 75, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	let avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));

	ctx.drawImage(avatar, 40, 40, 150, 150);

	if(member.id == '266275542691479554') {
		roundRect(ctx, 40, 40, 150, 150, 5, "rgba(240, 240, 240, 0.8)");
	}

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

async function getMemberWar(client, message, args) {
	let user = await getMemberFromArgs(message, args);
	if(!user) user = message.mentions.members.first();
	if(!user) user = message.member;
	let result = await participateModel.fetchByMemberId(user.id, message.guild.id);
	let embed = warHelper.buildEmbedMemberWar(client, result, user);
	message.channel.send(embed);
}

async function removeMember(client, message, args) {
	let user = await getMemberFromArgs(message, args);;

	if(!user) user = message.mentions.members.first();
	if(!user) {
		message.channel.send('Thành viên không hợp lệ.');
		return;
	}
	let userId = user.id;
	let guildId = message.guild.id;
	if(!client.guildsData[guildId].members[userId]) {
		message.channel.send('Thành viên này không có trong danh sách.');
		return;
	}
	
	try {
		await memberModel.delete({member_id: userId, guild_id: guildId});
		client.guildsData[guildId].members = await memberModel.fetchByGuildId(guildId);
		message.channel.send('Đã xóa thành viên khỏi danh sách!');
	} catch(e) {
		console.log(e);
		message.channel.send('Thành viên này chưa báo danh!');
	}
}

async function addMember(client, message, args) {
	let user = await getMemberFromArgs(message, args);
	if(!user) {
		message.channel.send('Thành viên không hợp lệ.');
		return;
	}

	let guildId = message.guild.id;

	if(client.guildsData[guildId].members[user.id]) {
		message.channel.send('Thành viên đã có trong danh sách.');
		return;
	}
	let member = getMemberInfo(args);
	try {
		
		member['member_id'] = user.id;
		member['guild_id'] = guildId;
		var query = { member_id: member.member_id, guild_id: member.guild_id };
        await memberModel.insertOrUpdate(query, member);
        client.guildsData[guildId].members = await memberModel.fetchByGuildId(guildId);
        message.channel.send('Đã thêm thành viên vào danh sách!');
		
	} catch(e) {
		console.log(e);
		message.channel.send('Không thể thêm thành viên này!');
	}
}

function getMemberInfo(args) {
	console.log(args);
	let memberInfo = {};
	for(let i = 0; i < args.length; i++) {
		if(i == 0) {
			memberInfo['family'] = args[i];
			continue;
		}

		if(i == 1) {
			memberInfo['character'] = args[i];
			continue;
		}
	}
	console.log(memberInfo);
	return memberInfo;
}

async function getMemberFromArgs(message, args) {
	let user = null;
	if(args.length == 0) return user;
	let userArgs = [];
	let index = 0;
	for(let i = 0; i < args.length; i++) {
		let current = args[i];
		index = i;
		if(current.indexOf('#') !== -1) {
			userArgs.push(current);
			break;
		}
		userArgs.push(current);
	}
	let discrim = userArgs.join(' ');
	if(userArgs.length == 0) {
		discrim = args.shift(); // the discrim/id
	} else {
		for(let j = 0; j < userArgs.length; j++) {
			args.shift(); //remove
		}
	}
	let members = await message.channel.guild.members.fetch();
	user = members.find(member => member.user.tag === discrim);
	if(!user) user = members.find(member => member.id === discrim);

	return user;
}