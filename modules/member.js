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
			+ '\nAP/DP/AWK: ' 
			+ userData['ap'] + '/' + userData['dp'] + '/' + userData['awk'] 
			+ '```');
	} catch {
		message.channel.send('Thành viên này chưa báo danh!');
	}
}
module.exports = modules;