'use strict';

const YoutubeDL = require('youtube-dl');
const ytdl = require('ytdl-core');
const options = require('../config/config.json');

var modules = {
	description: 'Music module'
};

let queues = {};

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
		let searchstring = args[0];
		if (!args[0].toLowerCase().startsWith('http')) {
			searchstring = 'gvsearch1:' + args[0];
		}
		YoutubeDL.getInfo(searchstring, ['-q', '--no-warnings', '--force-ipv4'], (err, info) => {
			// Verify the info.
			if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
				return response.edit('Video gì thế này!');
			}

			info.requester = message.author.id;

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
	if(args[0].length==0){
		text += `\nTrang 1 trên ${maxPage} (${queue.length-1} bài hát):\n`;
		if(maxPage==1){
			for(i=1;i<queue.length;i++){
				text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${idToName(queue[i].requester)}*`;
			}
		}
		else {
			for(i=1;i<=maxPerPage;i++){
				text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${idToName(queue[i].requester)}*`;
			}
		}
	}
	// Get the queue text.
	if(args[0] == 'all'){
		text += `\nTrang 1 trên ${maxPage} (${queue.length-1} bài hát):\n\n`;
		for(i=1;i<queue.length;i++){
				text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${idToName(queue[i].requester)}*`;
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
			text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${idToName(queue[i].requester)}*`;
			}
		}
		else if(page<maxPage){
			text += `\nTrang ${page} trên ${maxPage} (${queue.length-1} bài hát):\n`;
			for(i=(1+(page-1)*maxPerPage);i<(1+page*maxPerPage);i++){
			text+=`\n#${i} **${queue[i].title}**  [${correctTime(queue[i].duration)}] | Yêu cầu bởi *${idToName(queue[i].requester)}*`;
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

	const embedQueue = new Discord.RichEmbed();
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
	voiceConnection.player.dispatcher.end();
	voiceConnection.disconnect();
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
	if (!dispatcher.paused) dispatcher.pause();
};

/**
 * The command for changing the song volume.
 * 
 * @param {Message} message - Original message.
 * @param {string} args[0] - Command args[0].
 * @returns {<promise>} - The response message.
 */
function volume(message, args) {
	// Get the voice connection.
	const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
	if (voiceConnection === null) return message.reply('Hiện không phát bài nào!');
	if (voiceConnection != null && voiceConnection.channel != message.member.voiceChannel) {
		return message.reply('Mình ở kênh khác rồi!');
	}
	/*
	if (!isAdmin(message.member))
		return message.channel.sendMessage(wrap('You are not authorized to use this.'));
	*/
	if(isNaN(args[0])) return message.reply('Âm lượng từ 1-200. Vui lòng chọn lại!')
	// Get the dispatcher
	const dispatcher = voiceConnection.player.dispatcher;

	if (args[0] > 200 || args[0] < 0) return message.reply('Âm lượng lớn hơn 200, mời chọn lại!').then((response) => {
		response.delete(5000);
	});

	message.reply(`🔊 Âm lượng  ${args[0]}`);
	dispatcher.setVolume((args[0]/100));
}

/**
 * Executes the next song in the queue.
 * 
 * @param {Message} message - Original message.
 * @param {object} queue - The song queue for this server.
 * @returns {<promise>} - The voice channel.
 */
function executeQueue(message, queue, client) {
	// If the queue is empty, finish.
	if (queue.length === 0) {
		message.channel.send('⏹ No song to play, Im gonna leave!');

		// Leave the voice channel.
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
		if (voiceConnection !== null) return voiceConnection.disconnect();
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

		//console.log(video.webpage_url);

		// Play the video.
		message.channel.send(`🎼 Đang phát: **${video.title}**!`).then(() => {
			let dispatcher = connection.playStream(ytdl(video.webpage_url, {filter: 'audioonly'}), {seek: 0, volume: (DEFAULT_VOLUME/100)});

			connection.on('error', (error) => {
				// Skip to the next song.
				console.log(error);
				queue.shift();
				executeQueue(message, queue);
			});

			dispatcher.on('error', (error) => {
				// Skip to the next song.
				console.log(error);
				queue.shift();
				executeQueue(message, queue);
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
						executeQueue(message, queue);
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
function idToName(id){
	let ids = id+"";
	let user = client.users.get(ids);
	let message = user.lastMessage;
	let member = message.member;
	//return user.username;
	return member.nickname;
}

/*
 * Wrap text in a code block and escape grave characters.
 * 
 * @param {string} text - The input text.
 * @returns {string} - The wrapped text.
 */
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
	var numb = str.match(/\d+/g).map(Number);
	if(numb[1]<10){
		return `${numb[0]}:0${numb[1]}`;
	}
	else return str;
}
function wrap(text) {
	return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
}
module.exports = modules;