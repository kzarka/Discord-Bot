'use strict';

const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const options = require('../config/config.json');

var modules = {
	description: 'Music module'
};

let queues = {};
let loop = 0;

let GLOBAL = (options && options.global) || false;
let MAX_QUEUE_SIZE = (options && options.maxQueueSize) || 20;
let DEFAULT_VOLUME = (options && options.volume) || 50;
let ALLOW_ALL_SKIP = (options && options.anyoneCanSkip) || false;
let CLEAR_INVOKER = (options && options.clearInvoker) || false;

/**
 * Gets the song queue of the server.
 * 
 * @param {integer} server - The server id. 
 * @returns {object} - The song queue.
 */
function getQueue(server) {
	// Check if global queues are enabled.
	if (GLOBAL) server = '_'; // Change to global queue.

	// Return the queue.
	if (!queues[server]) queues[server] = [];
	return queues[server];
}

modules.play = function(client, message, args) {
	if(args.length == 0) {
		message.channel.send('Missing song name or url');
		return;
	}

	if (message.member.voiceChannel === undefined) return message.reply('You\'re not in a voice channel.');
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}

	// Get the queue.
	const queue = getQueue(message.guild.id);

	// Check if the queue has reached its maximum size.
	if (queue.length >= MAX_QUEUE_SIZE) {
		return message.reply('Không lưu được bài nữa đâu!');
	}

	// Get the video information.
	message.channel.send('🔎 Đang tìm...').then(response => {
		let searchstring = args.join(' ').trim();
		if (!args[0].toLowerCase().startsWith('http')) {
			searchstring = 'ytsearch:' + searchstring + '';
		}
		console.log(searchstring);
		YoutubeDL.getInfo(searchstring, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
			// Verify the info.
			if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
				return response.edit('Video gì thế này!');
			}

			info.requester = message.member.nickname || message.author.username;
			// Queue the video.
			response.edit(`📝 Thêm vào hàng đợi: **${info.title}**  | Thời lượng: ${correctTime(info.duration)}`).then(() => {
				queue.push(info);
				// Play if only one element in the queue.
				if (queue.length === 1) executeQueue(message, queue, client);
			}).catch(console.log);
		});
	}).catch(console.log);
};

modules.queue = function(client, message, args) {
	var text = "";
	let maxPage = 0;
	// Get the queue.
	let maxPerPage = 2;
	const queue = getQueue(message.guild.id);
	if(queue.length==0){
		return message.reply("📝 Hàng đợi trống!");
	}
	text = `🎼 Đang phát: **${queue[0].title}**\n`;
	if(queue.length<(maxPerPage+1)){
		maxPage = 1;
	}
	else maxPage = Math.ceil((queue.length-1)/maxPerPage);
	if(args.length == 0){
		text += `\nTrang 1 trên ${maxPage} (${queue.length-1} bài hát):\n`;
		if(maxPage==1){
			for(i=1;i<queue.length;i++){
				text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${queue[i].requester}*`;
			}
		}
		else {
			for(i=1;i<=maxPerPage;i++){
				text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${queue[i].requester}*`;
			}
		}
	}
	// Get the queue text.
	if(args[0] == 'all'){
		text += `\nTrang 1 trên ${maxPage} (${queue.length-1} bài hát):\n\n`;
		for(i=1;i<queue.length;i++){
				text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${queue[i].requester}*`;
		}
	}
	else if(!isNaN(args[0])){
		let page = parseInt(args[0]);
		if(page>4) return message.reply('Số trang không tồn tại!');
		if(page>maxPage){
			return message.reply('Số trang không tồn tại!');
		}
		if(page == maxPage){
			text += `\nTrang ${page} trên ${maxPage} (${queue.length-1} bài hát):\n`;
			for(i=(1+(page-1)*maxPerPage);i<queue.length;i++){
			text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${queue[i].requester}*`;
			}
		}
		else if(page<maxPage){
			text += `\nTrang ${page} trên ${maxPage} (${queue.length-1} bài hát):\n`;
			for(i=(1+(page-1)*maxPerPage);i<(1+page*maxPerPage);i++){
			text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${queue[i].requester}*`;
			}
		}

	}
	
	text+= "\n\n------------------------\nℹ Dùng ``?queue [page]`` để xem các trang kế"+`\n\n${isLoop()}`;

	// Get the status of the queue.
	let queueStatus = '⏹';
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection !== null) {
		const dispatcher = voiceConnection.player.dispatcher;
		//queueStatus = dispatcher.paused ? '⏸' : '▶';
	}

	const embedQueue = new client.Discord.RichEmbed();
    embedQueue.setColor(0xff00ff);
    embedQueue.setTitle(`🎧 **Danh sách hàng đợi**`);
    
    embedQueue.setThumbnail('http://www.freeiconspng.com/uploads/disco-icon-png-10.png');
    embedQueue.setFooter("© Black Spirit");
	// Send the queue and status.
	if(queue.length==1){
		text = `🎼 Đang phát: **${queue[0].title}**\n\nHàng đợi rỗng!\n\n------------------------\n${isLoop()}`;
	}
	embedQueue.setDescription(text);
	message.channel.send(embedQueue);
};

modules.stop = function(client, message, args) {
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.channel.send('Mình chẳng ở kênh nào cả');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	// Clear the queue.
	const queue = getQueue(message.guild.id);
	queue.splice(0, queue.length);

	// End the stream and disconnect.
	try {
		voiceConnection.player.dispatcher.end();
		voiceConnection.disconnect();
		return message.channel.send('Dừng phát và rời voice channel!');
	} catch(e) {
		message.channel.send('Error!');
	}
};

modules.pause = function(client, message, args) {
	// Get the voice connection.
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.reply('Không có bài hát nào đang phát!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	// Pause.
	message.channel.send('⏸ Đã tạm dừng!');
	const dispatcher = voiceConnection.player.dispatcher;
	try {
		if (!dispatcher.paused) dispatcher.pause();
	} catch(e) {}
};

//skip a song from queue
modules.skip = function(client, message, args) {
	// Get the voice connection.
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.channel.send('Có gì để phát đâu mà skip!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.channel.send('Mình ở kênh khác rồi!');
	}
	// Get the queue.
	const queue = getQueue(message.guild.id);
	let song = queue[0];
	if (!canSkip(message.member, queue, 0)) return message.channel.send(`Không thể bỏ qua bài này vì bạn không yêu cầu nó, yêu cầu bởi ${idToName(song.requester)}`).then((response) => {
		response.delete(5000);
	});
	if(loop==1){
		loop=0;
	}
	queue.splice(0, 0);

	// Resume and stop playing.
	const dispatcher = voiceConnection.player.dispatcher;
	if (voiceConnection.paused) dispatcher.resume();
	try {
		return dispatcher.end();
	} catch(e) {
		console.log(e);
	}

	message.channel.send(`⏭ Đã bỏ qua **${queue[0].title}**!`);
};

modules.remove = function(client, message, args) {
	// Get the voice connection.
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.channel.send('Có bài nào đâu mà xóa!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi nhé!');
	}
	if(args.length == 0) {
		return message.channel.send('Chọn số thứ tự bài cần xóa khỏi hàng đợi!');
	}
	let position = args.shift();
	if(isNaN(position)) return message.channel.send('Chọn số thứ tự bài cần xóa khỏi hàng đợi!');
	// Get the queue.
	const queue = getQueue(message.guild.id);

	let toSkip = parseInt(position);
	if(toSkip<=0){
		return message.reply('Có bài đó trong hàng đợi à?');
	}
	if (toSkip >= queue.length) {
		return message.channel.send('Có bài đó trong hàng đợi à');
	}
	let song = queue[toSkip];
	if (!canSkip(message.member, queue, toSkip)) return message.channel.send(`Không thể xóa vì bạn không yêu cầu nó, yêu cầu bởi ${idToName(song.requester)}`).then((response) => {
		response.delete(5000);
	});
	
	// Skip.
	queue.splice(toSkip, 1);

	message.channel.send('📝 Đã xóa **' + song.title + '** khỏi hàng đợi!');
};

/**
 * The command for changing the song volume.
 * 
 * @param {Message} message - Original message.
 * @param {string} args[0] - Command args[0].
 * @returns {<promise>} - The response message.
 */
modules.volume = function(client, message, args) {
	// Get the voice connection.
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.reply('Hiện không phát bài nào!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	// Get the dispatcher
	const dispatcher = voiceConnection.player.dispatcher;
	if(args.length == 0) {
		return message.channel.send(client.helper.wrap(`Âm lượng hiện tại ${dispatcher.volume*100}`));
	}
	/*
	if (!isAdmin(message.member))
		return message.channel.sendMessage(wrap('You are not authorized to use this.'));
	*/
	if(isNaN(args[0])) return message.reply('Âm lượng từ 1-200. Vui lòng chọn lại!')
	

	if (args[0] > 200 || args[0] < 0) return message.reply('Âm lượng lớn hơn 200, mời chọn lại!').then((response) => {
		response.delete(5000);
	});

	message.reply(`🔊 Âm lượng  ${args[0]}`);
	try {
		dispatcher.setVolume((args[0]/100));
	} catch(e) {}
}

/**
 * The command for leaving the channel and clearing the queue.
 * 
 * @param {Message} message - Original message.
 * @param {array} args - Command args.
 * @returns {<promise>} - The response message.
 */
modules.leave = function(client, message, args) {
	
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.channel.send('Mình chẳng ở kênh nào cả');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	// Clear the queue.
	const queue = getQueue(message.guild.id);
	queue.splice(0, queue.length);

	// End the stream and disconnect.
	try {
		voiceConnection.player.dispatcher.end();
		voiceConnection.disconnect();
	} catch(e) {}
}

//loop

modules.repeat = function(client, message, args){
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.channel.send('Mình chẳng ở kênh nào cả!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	let type = null;
	if(args.length > 0) type = args.shift();
	if(!type){
		if(loop!=1){
			loop = 1;
			return message.channel.send('🔂 Bật phát lại 1 bài!');
		}
		else {
			loop = 0;
			return message.channel.send('▶ Tắt phát lại!');
		}
	}
	if(type == "all"){
		if(loop!=2){
			loop = 2;
			return message.channel.send('🔁 Bật phát lại hàng đợi!');
		}
		else {
			loop = 0;
			return message.channel.send('▶ Tắt phát lại!');
		}
	}
}

/**
 * The command for clearing the song queue.
 * 
 * @param {Message} message - Original message.
 * @param {string} args - Command args.
 */
modules.clearqueue = function(client, message, args) {
	if (isAdmin(message.member)) {
		const queue = getQueue(message.guild.id);

		queue.splice(0, queue.length);
		message.channel.send('Queue cleared!');
	} else {
		message.channel.send('You don\'t have permission to use that command!');
	}
}

/**
 * The command for resuming the current song.
 * 
 * @param {Message} message - Original message.
 * @param {array} args - Command args.
 * @returns {<promise>} - The response message.
 */
modules.resume = function(client, message, args) {
	// Get the voice connection.
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.reply('Không phát bài nào!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	/*
	if (!isAdmin(message.member))
		return message.channel.sendMessage(wrap('You are not authorized to use this.'));
	*/
	// Resume.
	message.channel.send('▶ Tiếp tục phát!');
	const dispatcher = voiceConnection.player.dispatcher;
	try{
		if (dispatcher.paused) return dispatcher.resume();
	} catch(e) {
		console.log(e);
	}
	
}

/**
 * Executes the next song in the queue.
 * 
 * @param {Message} message - Original message.
 * @param {object} queue - The song queue for this server.
 * @returns {<promise>} - The voice channel.
 */
async function executeQueue(message, queue, client) {
	// If the queue is empty, wait 10s then finish.
	if (queue.length === 0 ) {
		setTimeout(function(message, queue, client) {
			if (queue.length === 0 ) {
				message.channel.send('⏹ No song to play, Im gonna leave!');

				// Leave the voice channel.
				const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
				if (voiceConnection !== null) return voiceConnection.disconnect();
			}
		}, 10000, message, queue, client);
	}

	new Promise((resolve, reject) => {
		// Join the voice channel if not already in one.
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
		if (voiceConnection === null) {
			// Check if the user is in a voice channel.
			if (message.member.voiceChannel) {
				message.member.voiceChannel.join().then(connection => {
					resolve(connection);
				}).catch((error) => {
					console.log(error);
					message.channel.send('There was an issue connecting to the voice channel.')
					queue.splice(0, queue.length);
				});
			} else {
				// Otherwise, clear the queue and do nothing.
				queue.splice(0, queue.length);
				reject();
			}
		} else {
			resolve(voiceConnection);
		}
	}).then(connection => {
		// Get the first item in the queue.
		const video = queue[0];
		// Play the video.
		message.channel.send(`🎼 Đang phát: **${video.title}**!`).then(async () => {
			let dispatcher = await connection.playStream(ytdl(video.webpage_url, {filter: 'audioonly'}), {seek: 0, volume: (DEFAULT_VOLUME/100)});

			connection.on('error', (error) => {
				// Skip to the next song.
				console.log(error);
				queue.shift();
				executeQueue(message, queue, client);
			});

			dispatcher.on('error', (error) => {
				// Skip to the next song.
				console.log(error);
				queue.shift();
				executeQueue(message, queue, client);
			});

			dispatcher.on('end', () => {
				// Wait a second.
				setTimeout(() => {
					let song = null;
					if (queue.length > 0) {
						// Remove the song from the queue.
						song = queue.shift();
						if(loop==1){
							queue.unshift(song);
						}
						else if(loop==2){
							queue.push(song);
						}
						// Play the next song in the queue.
						executeQueue(message, queue, client);
					}
					else loop = 0;
				}, 1000);
			});
		}).catch((error) => {
			console.log(error);
		});
	}).catch((error) => {
		console.log(error);
	});
}

//get loop status
function isLoop(){
	switch(loop){
		case 0:
			return "▶ Repeat: No";
		case 1:
			return "🔂 Repeat: Current Song";
		case 2:
			return "🔁 Repeat: All";
	}
}
//to get date upload
function strToDate(date){
	let str = date+""
	let year = str.slice(0,4);
	let month = str.slice(4,6);
	let day = str.slice(6,8);
	return (`${day}/${month}/${year}`)
}
//to get duration time
function correctTime(str){
	if(str == 0) return str;
	var numb = str.match(/\d+/g).map(Number);
	if(numb[1]<10){
		return `${numb[0]}:0${numb[1]}`;
	}
	if(numb.length == 1) return `0:${numb[0]}`;
	return str;
}

function canSkip(member, queue, id) {
	return true;
	if (ALLOW_ALL_SKIP) return true;
	else if (queue[id].requester === member.id) return true;
	else return false;
}

module.exports = modules;