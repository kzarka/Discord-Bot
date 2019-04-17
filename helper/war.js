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
                newEmbed.addField("DANH SÁCH NODE WAR", list).addBlankField(true);
                topMessage.edit('', newEmbed).catch(console.error);
            }
        }).catch(err => {
            console.log('Error while doing edit messages');
            console.log(err);
        });
    }
}

helper.buildList = function(client) {
    let maxNameLength = this.getlongestNameLength(client) + 1;
    let maxClassLength = this.getMaxClassNameLength() + 1;
    let maxLengthLevel = 'Level'.length + 4;
    let maxLengthPosition = 3;
    let listString = '``' +`${'STT'.padEnd(maxLengthPosition, ' ')} Family/${'Character'.padEnd((maxNameLength - 'Family'.length),' ')} ${'Class'.padEnd(maxClassLength, ' ')} ${'Level'.padEnd(maxLengthLevel, ' ')} AP/AWK/DP\n` + '``\n';
    if(client.war.joined == void(0) || client.war.joined.length == 0) {
        return listString;
    }
    let totalGS = 0;
    let totalReported = 0;
    for(let x = 0; x < client.war.joined.length; x++) {

        let id = client.war.joined[x];
        let positition = (x+1) + '.';
        if(!client.war.members[id]) {
            let user = client.users.get(id)
            let username = '???';
            if(user && user.username) {
                username = user.username;
            }
            listString += '``' + `${positition.padEnd(maxLengthPosition, ' ')} ${username.padEnd((maxNameLength+1),' ')}  ${'???'.padEnd(maxClassLength, ' ')} ${'??'.padEnd(maxLengthLevel, ' ')} ??/??/??` + '``\n';
            continue;
        }
        let member = client.war.members[id];
        let character = member.character || '???';
        let className = member.class || '???';
        let level = member.level || '??';
        level = level + '';
        listString += '``' + ` ${positition.padEnd(maxLengthPosition, ' ')} ${member.family}/${character.padEnd((maxNameLength - member.family.length),' ')} ${className.padEnd(maxClassLength,' ')} ${level.padEnd(maxLengthLevel, ' ')} ${member.ap ||'??'}/${member.awk || '??'}/${member.dp ||'??'}` + '``\n';
        totalGS += parseInt(member.awk) + parseInt(member.dp);
        totalReported++;
    }
    listString += '\n``Average GS: ' + Math.ceil(totalGS/totalReported) + '``';
    return listString;
}

helper.getlongestNameLength = function (client) {
    let maxLength = 'FamilyCharacter'.length;
    let joined = client.war.joined;
    let members = client.war.members;
    if(!joined || joined.length == 0) return 'FamilyCharacter'.length;
    for(let i in joined) {
        let id = joined[i];
        let thisLength = 0;
        // case not report gs
        if(!client.war.members[id]) {
            let user = client.users.get(id);
            if(!user) continue;
            thisLength = user.username.length;
            if(thisLength > maxLength) {
                maxLength = thisLength;
                continue;
            }
            continue;
        }
        // case gs reported
        thisLength =  members[id].family.length;
        if(members[id].character) {
            thisLength += members[id].character.length;
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