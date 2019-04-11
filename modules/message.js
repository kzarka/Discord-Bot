'use strict';

const dataDir = '/data/modules/message/';

var modules = {
	description: 'Edit message'
};

/* Default value for messages */
const DEFAULT_MESSAGE = {
	'welcome': 'Xin chào {user}. Chúc bạn một ngày vui vẻ!'
}

modules.message = function(client, message, args) {
	if(args.length == 0) {
		message.channel.send('Go on!');
		return;
	}
	switch(args) {
		case 'edit': {
			
		}
	}
};

function getMessageContent(type = 'welcome') {

}

function editMessageContent(type = 'welcome') {

}
module.exports = modules;