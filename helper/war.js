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
                    newEmbed.setDescription("Hiện không có war nào!");
                } else {
                    let info = `Node: ${client.war.node || 'TBD'}\n`;
                    if(client.war.message) {
                        info += `Message: ${client.war.message}`;
                    }
                    newEmbed.setDescription(info);
                }
                newEmbed.addField("DANH SÁCH NODE WAR", list)
                newEmbed.addBlankField().addBlankField(true);
                topMessage.edit('', newEmbed).catch(console.error);
            }
        }).catch(err => {
            console.log('Error while doing edit messages');
            console.log(err);
        });
    }
}

helper.buildList = function(client) {
    let maxNameLength = this.getlongestNameLenght(client) + 5;
    let maxClassLength = this.getMaxClassNameLength() + 5;

    let listString = '``' +`${'STT'.padEnd(4,' ')} Family/${'Character'.padEnd((maxNameLength - 'Family'.length),' ')} ${'Class'.padEnd((maxClassLength), ' ')} AP/AWK/DP\n` + '``\n';
    if(client.war.joined == void(0) || client.war.joined.length == 0) {
        return listString;
    }
    for(let x = 0; x < client.war.joined.length; x++) {

        let id = client.war.joined[x];
        let positition = (x+1) + '.';
        if(!client.war.members[id]) {
            let user = client.users.get(id)
            let username = '???';
            if(user && user.username) {
                username = user.username;
            }
            listString += '``' + `${positition.padEnd(4,' ')} ${username.padEnd((maxNameLength+1),' ')}  ${'???'.padEnd((maxClassLength), ' ')} ??/??/??` + '``\n';
            continue;
        }
        let member = client.war.members[id];
        let character = member.character || '???';
        let className = member.class || '???';
        listString += '``' + ` ${positition.padEnd(4 ,' ')} ${member.family}/${character.padEnd((maxNameLength - member.family.length),' ')} ${className.padEnd((maxClassLength),' ')} ${member.ap ||'??'}/${member.awk || '??'}/${member.dp ||'??'}` + '``\n';
    }
    return listString;
}

helper.getlongestNameLenght = function (client) {
    let maxLength = 'FamilyCharacter'.length;
    let members = client.war.members
    for(let i in members) {
        let thisLength = members[i].family.length;
        if(members[i].character) {
            thisLength += members[i].character.length;
        }
        if(thisLength > maxLength) {
            maxLength = thisLength;
        }
    }
    return maxLength;
}

helper.getMaxClassNameLength = function() {
    return 'dark knight'.length;
}

module.exports = helper;