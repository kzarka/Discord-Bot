'use strict';

const fs = require("fs");

var helper = {
    description: "War helper"
}

const warStart = '20:00'
const warEnd = '21:00';

const maxDateWar = 7;
const recheckWarMin = 10; // minute

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
                    let info = this.buildDescription(client);
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
        if(!client.members[id]) {
            let user = client.users.get(id)
            let username = '???';
            if(user && user.username) {
                username = user.username;
            }
            listString += '``' + `${positition.padEnd(maxLengthPosition, ' ')} ${username.padEnd((maxNameLength+1),' ')}  ${'???'.padEnd(maxClassLength, ' ')} ${'??'.padEnd(maxLengthLevel, ' ')} ??/??/??` + '``\n';
            continue;
        }
        let member = client.members[id];
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
    let members = client.members;
    if(!joined || joined.length == 0) return 'FamilyCharacter'.length;
    for(let i in joined) {
        let id = joined[i];
        let thisLength = 0;
        // case not report gs
        if(!client.members[id]) {
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

helper.validDate = function(date) {
    if(!date) return false;
    date = date.trim();
    var pattern = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    // if passes basic test
    if(!pattern.test(date)) return false;
    let items = date.split('/');
    let now = new Date();
    let inputDate = parseInt(items[0]);
    let inputMonth = parseInt(items[1]) - 1;
    let inputYear = parseInt(items[2]);
    if(inputYear != now.getFullYear()) return false;
    let desireDate = new Date(inputYear, inputMonth, inputDate);
    // if desire greater than 7 days from now return
    if((desireDate.getTime() - now.getTime()) >= maxDateWar*24*3600*1000) return false;
    // if enable war in current day after war time return
    if((now.getDate() == desireDate.getDate()) && (now.getMonth() == desireDate.getMonth())) {
        let endWarTime = new Date(inputYear, inputMonth, inputDate, 22);
        if(endWarTime.getTime() <= now.getTime()) return false;
    }
    return `${desireDate.getDate()}/${desireDate.getMonth() + 1}/${desireDate.getFullYear()}`;
}

helper.saveWarInfo = function(client, datDir) {
    let data = JSON.stringify(client.war, null, 4);
    fs.writeFileSync(`.${datDir}/war.json`, data, 'utf8', 'w', (err) => {
        if (err) {
            console.log(err);
        }
    });
}

helper.inWarTime = function() {
    let now = Date.now();
    if(now >= this.hourToDay(warStart).getTime() && now <= this.hourToDay(warEnd).getTime()) {
        return true;
    }
    return false;
}

helper.buildDescription = function(client) {
    let info = `Node: ${client.war.node || 'TBD'} - ${client.war.date}\n`;
    if(client.war.message) {
        info += `Message: ${client.war.message || ''}`;
    }
    return info;
}

helper.hourToDay = function(hour){
    var day = new Date();
    h = parseInt(hour.split(':')[0]);
    m = parseInt(hour.split(':')[1]);
    day.setHours(h);
    day.setMinutes(m);
    return day;
}

/* Auto shutdown war check */
helper.warAutoShutdown = function(client, datDir) {
    if(!client.war.war) return;
    let now = new Date();
    let items = client.war.date.split('/');
    let endWarTime = new Date(items[2], items[1], items[0], 22);
    // war end on desire day
    if(now.getTime() >= endWarTime.getTime()) {
        client.war = {
            "war": false
        }
        helper.saveWarInfo(client, datDir);
        return;
    }
    setTimeout(this.warAutoShutdown, recheckWarMin*60000, client);
}

module.exports = helper;