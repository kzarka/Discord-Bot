'use strict';

var helper = {
    description: "War helper"
}

helper.reloadTopMessage = function(channelObject, client) {
    if(channelObject) {
        channelObject.fetchMessages().then(messages => {
            let topMessage = messages.filter(msg => msg.author.bot).last();
            if(topMessage) {
                let embed = topMessage.embeds[0];
                let list = this.buildList(client);
                embed.fields = null;
                
                const newEmbed = new client.Discord.RichEmbed(embed);
                if(client.war.war == false) {
                    newEmbed.setDescription("Hiện không có war nào!")
                    .addBlankField(true).addBlankField(true);
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

helper.buildList = function(client) {
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
        listString += `${x+1}. **${member.family}/${member.character || '??'}**  **${member.class || '??'} ${member.ap ||'??'}/${member.awk || '??'}/${member.dp ||'??'}**\n`;
    }
    return listString;
}

module.exports = helper;