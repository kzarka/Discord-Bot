'use strict';

const fs = require("fs");

var helper = {
    description: "War helper"
}

const warStart = '20:00'
const warEnd = '21:00';

const maxDateWar = 7;
const recheckWarMin = 1; // minute

const rowPerPage = 10;

helper.reloadTopMessage = function(channelObject, client) {
    if(channelObject) {
        channelObject.fetchMessages().then(messages => {
            let topMessage = messages.filter(msg => msg.author.bot).last();
            if(topMessage) {
                let newEmbed = this.buildEmbed(client);
                topMessage.edit('', newEmbed).catch(console.error);
            }
        }).catch(err => {
            console.log('Error while doing edit messages');
            console.log(err);
        });
    }
}

helper.buildList = function(client) {
    /* array for storing pages */
    let pages = [];
    let maxNameLength = this.getlongestNameLength(client) + 1;
    let maxClassLength = this.getMaxClassNameLength() + 1;
    let maxLengthLevel = 'Level'.length + 4;
    let maxLengthPosition = 3;
    let listString = '``' +`${'STT'.padEnd(maxLengthPosition, ' ')} Family/${'Character'.padEnd((maxNameLength - 'Family'.length),' ')} ${'Class'.padEnd(maxClassLength, ' ')} ${'Level'.padEnd(maxLengthLevel, ' ')} AP/AWK/DP\n` + '``\n';
    if(client.war.joined == void(0) || client.war.joined.length == 0) {
        pages.push(listString);
        return pages;
    }
    let totalGS = 0;
    let totalReported = 0;
    // asign to var to prevent some exception
    let joined = client.war.joined;
    for(let x = 0; x < joined.length; x++) {
        let id = joined[x];
        let positition = (x+1);
        let posititionString = positition + '.';
        if(!client.members[id]) {
            let user = client.users.get(id)
            let username = '???';
            if(user && user.username) {
                username = user.username;
            }
            listString += '``' + `${posititionString.padEnd(maxLengthPosition, ' ')} ${username.padEnd((maxNameLength+1),' ')}  ${'???'.padEnd(maxClassLength, ' ')} ${'??'.padEnd(maxLengthLevel, ' ')} ??/??/??` + '``\n';
            // go next here so check asign array
            if((positition % rowPerPage == 0) || (positition == joined.length)) {
                pages.push(listString);
                listString = '';
            }
            // then continue
            continue;
        }
        let member = client.members[id];
        let character = member.character || '???';
        let className = member.class || '???';
        let level = member.level || '??';
        level = level + '';
        listString += '``' + ` ${posititionString.padEnd(maxLengthPosition, ' ')} ${member.family}/${character.padEnd((maxNameLength - member.family.length),' ')} ${className.padEnd(maxClassLength,' ')} ${level.padEnd(maxLengthLevel, ' ')} ${member.ap ||'??'}/${member.awk || '??'}/${member.dp ||'??'}` + '``\n';
        totalGS += parseInt(member.awk) + parseInt(member.dp);
        totalReported++;
        // go next here so check again
        if((positition % rowPerPage == 0) || (positition == joined.length)) {
            pages.push(listString);
            listString = '';
        }

    }
    // if empty then no GS
    if(joined.length && joined.length > 0) {
       pages.push('\n``Average GS: ' + Math.ceil(totalGS/totalReported) + '``');
    }
    return pages;
}

helper.buildEmbed = function(client) {
    const embed = new client.Discord.RichEmbed()
        //.setTitle("This is your title, it can hold 256 characters")
        //.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .setAuthor("Node War", "https://i.imgur.com/h9cOtT9.png")
        .setColor(0x00AE86)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("Xuan Bot", "https://i.imgur.com/h9cOtT9.png")
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("https://i.imgur.com/ZkoC0RM.png")
        .setTimestamp();

    let list = this.buildList(client);
    // set fields
    for(let i = 0; i < list.length; i++) {
        if(i == 0) {
            embed.addField("DANH SÁCH NODE WAR", list[i]);
            continue;
        }
        embed.addField("\u200B", list[i]);
    }
    embed.addBlankField(true);
    // add description
    if(!client.war.war) {
        embed.setDescription("Hiện không có war nào!");
        return embed;
    }
    let info = `Node: ${client.war.node || 'TBD'} - ${client.war.date}\n`;
    if(client.war.message) {
        info += `Message: ${client.war.message || ''}`;
    }
    embed.setDescription(info);
    return embed;
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
    let that = this;
    if(!client.war.war) return;
    let now = new Date();
    let items = client.war.date.split('/');
    let endWarTime = new Date(items[2], (items[1] - 1), items[0], 22);
    // war end on desire day
    if(now.getTime() >= endWarTime.getTime()) {
        client.war = {
            "war": false
        }
        helper.saveWarInfo(client, datDir);
        return;
    }
    setTimeout(function() {
        that.warAutoShutdown(client, datDir)
    }, recheckWarMin*10000);
}

module.exports = helper;