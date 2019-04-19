'use strict';

const dataDir = '/data/modules/enhance/';
const Discord = require("discord.js");

var modules = {
	description: 'Music module',
	allowToAsignRole: false
};

modules.role = function(client, message, args) {
	if (message.author.id != '213722448070180864') return;
	if(args.length == 0) return message.channel.send('Where is my parameters?');
	if(args[0] == 'reset') {
		message.channel.send(`Reset all members's role, Y/N?`);
		const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.on('collect', msg => {
        	if(msg.author.bot) return;
            if (msg.content == "yes") {
            	message.guild.members.forEach(member => {
					// if bot return
					if(member.user.bot) return;
					// if officer return
					let roles = member.roles;
					if(!roles) return;
					let isOfficer = roles.some(role => role.name === 'Officer');
					if(isOfficer) return;
					let roleToKeep = ['VIP', 'Filthy Outsider', 'Carrying Fury Scrubs', 'Guest', 'Ng0k', '( ͡° ͜ʖ ͡°)'];
					removeRoles(message, member, roleToKeep);
					return;
				});
            	message.channel.send(`Reseted all members's role!`);
            }
            return;
        });
	}
	if(args[0] == 'off') {
		this.allowToAsignRole = false;
		message.channel.send(`Disabled role commands!`);
	}
};

modules.warrior = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'warrior';
	addRole(client, message, className);

};

modules.sorceress = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'sorceress';
	addRole(client, message, className);
};

modules.ranger = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'ranger';
	addRole(client, message, className);
};

modules.berserker = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'berserker';
	addRole(client, message, className);
};

modules.tamer = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'tamer';
	addRole(client, message, className);
};

modules.valkyrie = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'valkyrie';
	addRole(client, message, className);
};

modules.musa = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'musa';
	addRole(client, message, className);
};

modules.maehwa = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'maehwa';
	addRole(client, message, className);
};

modules.witch = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'witch';
	addRole(client, message, className);
};

modules.wizard = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'wizard';
	addRole(client, message, className);
};

modules.ninja = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'ninja';
	addRole(client, message, className);
};

modules.kunoichi = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'kunoichi';
	addRole(client, message, className);
};

modules.darkknight = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'darkknight';
	addRole(client, message, className);
};

modules.striker = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'striker';
	addRole(client, message, className);
};

modules.mystic = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'mystic';
	addRole(client, message, className);
};

modules.archer = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'archer';
	addRole(client, message, className);
};

modules.lahn = function(client, message, args) {
	if(!this.allowToAsignRole) return;
	let className = 'lahn';
	addRole(client, message, className);
};

function addRole(client, message, roleName) {
	let classNameFirstUpper = roleName.charAt(0).toUpperCase() + roleName.slice(1);
	let role = message.guild.roles.find(r => r.name === classNameFirstUpper);
	if(!role) return message.channel.send(`Không tìm thấy role này!`);
	if(message.member.roles.has(role.id)) {
  		message.channel.send('Bạn đã có role này rồi');
  		return;
	}
	/* Now add role to member */
	message.member.addRole(role).then( () => {
		message.channel.send(`Bạn đã thêm ${classNameFirstUpper} thành công!`);
	}).catch( () => {
		message.channel.send(`Không thể thêm role này!`);
	});
}

function removeRole(member, roleName) {
	let role = message.guild.roles.find(r => r.name === roleName);
	if(!role) return false;
	member.removeRole(role)
  	.catch(err => {
  		console.log(err);
  	});

}

function removeRoles(message, member, roleToKeep) {
	let roles = member.roles;
	roles = roles.filter(function(role) {
		if(!roleToKeep) return true;
		if(roleToKeep.constructor !== Array) {
			return role.name !== roleToKeep;
		}
  		for(let i in roleToKeep) {
  			if(role.name == roleToKeep[i]){
  				return false;
  			}
  			return true;
  		}
	});
	member.removeRoles(roles).catch(err => {
		console.log(err);
	});

}

function correctString(text) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = modules;