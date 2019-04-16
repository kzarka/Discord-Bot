'use strict';
const fs = require("fs");
const Discord = require("discord.js");

var modules = {
	description: 'War Module'
};
const datDir = '/data/dependencies/war';
const warVoteChannel = 'war-attendance';

const warStart = '20:00'
const warEnd = '21:00'

var channelWar = null;
// Global variable for member stats
modules.war = function(client, message, args) {

	try {
        channelWar = client.channels.find(x => x.name === warVoteChannel);
    } catch(e) {
        console.log(e)
    }
	if(args.length == 0) {
		message.channel.send('Sử dụng `war enable [node] [message]` để kích hoạt vote war!');
		return;
	}
	if(args[0] == 'enable') {
		if(client.war.war == true) {
			message.channel.send('War đã mở từ trước');
			return;
		}
		if(inWarTime()) {
			message.channel.send('Không thể mở vote từ 20h-22h');
			return;
		}
		client.war.war = true;
		client.war.node = args[1] || null;
		client.war.message = args[2] || null;
		let data = {
			"inwar": true,
			"node": client.war.node,
			"message": client.war.message
		}
		data = JSON.stringify(data, null, 4);
        fs.writeFileSync(`.${datDir}/war.json`, data, 'utf8', 'w', (err) => {
            if (err) {
                console.log(err);
            }
        });
        reloadTopMessage(channelWar, client);
        message.channel.send('Đã khởi động war!');
		return;
	}
	if(args[0] == 'disable') {
		if(client.war.war == false) {
			message.channel.send('War hiện không mở');
			return;
		}
		message.channel.send('Mọi dữ liệu vote sẽ mất, gõ yes để xác nhận!');
		const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        collector.on('collect', message => {
            if (message.content == "yes") {
            	client.war.war = false
                client.war.joined = {}
            	let data = {
					"inwar": false
				}
				data = JSON.stringify(data, null, 4);
		        fs.writeFileSync(`.${datDir}/war.json`, data, 'utf8', 'w', (err) => {
		            if (err) {
		                console.log(err);
		            }
		        });
		        reloadTopMessage(channelWar, client);
                message.channel.send("Đã hủy bỏ war!");
            }
        })
	}

};

module.exports = modules;

function reloadTopMessage(channelObject, client) {
    if(channelObject) {
        channelObject.fetchMessages().then(messages => {
            let topMessage = messages.filter(msg => msg.author.bot).last();
            if(topMessage) {
                let embed = topMessage.embeds[0];
                let list = buildList(client);
                embed.fields = null;
                
                const newEmbed = new Discord.RichEmbed(embed);
                if(client.war.war == false) {
                    newEmbed.setDescription("Hiện không có war nào!");
                } else {
                    let info = `Node: ${client.war.node || 'TBD'}\n`;
                    if(client.war.message) {
                        info += `Message: ${client.war.message}`;
                    }
                    newEmbed.setDescription(info);
                    newEmbed.addField("DANH SÁCH NODE WAR", list)
                    .addBlankField(true).addBlankField(true);
                }
                topMessage.edit('', newEmbed).catch(console.error);
            }
        }).catch(err => {
            console.log('Error while doing edit messages');
            console.log(err);
        });
    }
}

function buildList(client) {
    if(client.war.joined == void(0) || client.war.joined.length == 0) {
        return "1. ---";
    }
    let listString = '';
    for(let x = 0; x < client.war.joined.length; x++) {
        let id = client.war.joined[x];
        if(!client.war.members[id]) {
            let user = client.users.get(id)
            let username = '???';
            if(user && user.username) {
                username = user.username;
            }
            listString += `${x+1}. **${username}**  ?? ??/??/??\n`;
            continue;
        }
        let member = client.war.members[id];

        listString += `${x+1}. **${member.family}/${member.main || '??'}**  ${member.class || '??'} ${member.ap ||'??'}/${member.awk || '??'}/${member.dp ||'??'}\n`;
    }
    return listString;
}

function hourToDay(hour){
    var day = new Date();
    h = parseInt(hour.split(':')[0]);
    m = parseInt(hour.split(':')[1]);
    day.setHours(h);
    day.setMinutes(m);
    return day;
}

function inWarTime() {
	let now = Date.now();
    if(now >= hourToDay(warStart).getTime() && now <= hourToDay(warEnd).getTime()) {
    	return true;
    }
    return false;
}