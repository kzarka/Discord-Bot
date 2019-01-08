'use strict';

const dataDir = '/data/modules/enhance/';

var modules = {
	description: 'Music module'
};

modules.warrior = function(client, message, args) {
	let className = 'warrior';
	addRoleBase(client, message, className);

};

modules.sorceress = function(client, message, args) {
	let className = 'sorceress';
	addRoleBase(client, message, className);
};

modules.ranger = function(client, message, args) {
	let className = 'ranger';
	addRoleBase(client, message, className);
};

modules.berserker = function(client, message, args) {
	let className = 'berserker';
	addRoleBase(client, message, className);
};

modules.tamer = function(client, message, args) {
	let className = 'tamer';
	addRoleBase(client, message, className);
};

modules.valkyrie = function(client, message, args) {
	let className = 'valkyrie';
	addRoleBase(client, message, className);
};

modules.musa = function(client, message, args) {
	let className = 'musa';
	addRoleBase(client, message, className);
};

modules.maehwa = function(client, message, args) {
	let className = 'maehwa';
	addRoleBase(client, message, className);
};

modules.witch = function(client, message, args) {
	let className = 'witch';
	addRoleBase(client, message, className);
};

modules.wizard = function(client, message, args) {
	let className = 'wizard';
	addRoleBase(client, message, className);
};

modules.ninja = function(client, message, args) {
	let className = 'ninja';
	addRoleBase(client, message, className);
};

modules.kunoichi = function(client, message, args) {
	let className = 'kunoichi';
	addRoleBase(client, message, className);
};

modules.darkknight = function(client, message, args) {
	let className = 'darkknight';
	addRoleBase(client, message, className);
};

modules.striker = function(client, message, args) {
	let className = 'striker';
	addRoleBase(client, message, className);
};

modules.mystic = function(client, message, args) {
	let className = 'mystic';
	addRoleBase(client, message, className);
};

modules.archer = function(client, message, args) {
	let className = 'archer';
	addRoleBase(client, message, className);
};

modules.lahn = function(client, message, args) {
	let className = 'lahn';
	addRoleBase(client, message, className);
};

function addRoleBase(client, message, className) {
	let classNameFirstUpper = className.charAt(0).toUpperCase() + className.slice(1);
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

module.exports = modules;