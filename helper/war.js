'use strict';

const fs = require("fs");

let warModels = require('../core/mongo/wars.js');
const joinModels = require("../core/mongo/war_participates.js");


var helper = {
    description: "War helper"
}

const warVoteChannel = 'war-attendance';


const warStart = '20:00'
const warEnd = '21:00';

const maxDateWar = 7;
const recheckWarMin = 1; // minute

const rowPerPage = 10;

helper.reloadTopMessage = async function(client, guildId) {
    let message = await helper.getMessage(client, guildId);
    if(message) {
        console.log(message);
        let newEmbed = this.buildEmbed(client, guildId);
        message.edit('', newEmbed).catch(console.error);
        return;
    }
    let channelWar = helper.getChannelWar(client, guildId);
    if(channelWar) {
        let newEmbed = this.buildEmbed(client, guildId);
        if(!newEmbed) return;
        channelWar.send(newEmbed).then(async message => {
            let messageId = message.id;
            await helper.updateWar(client, guildId, messageId);
        });
    }
}

helper.getMessage = async function (client, guildId) {
    let channelWar = helper.getChannelWar(client, guildId);
    if(!channelWar) return null;
    let warData = helper.getGuildWarData(client, guildId);
    if(!warData || !warData.message_id) return null;
    let message = null;
    try {
        message = await channelWar.messages.fetch(warData.message_id, true, true);
    } catch (e) {
        return null;
    }
    return message;
}

helper.getGuildWarData = function (client, guildId) {
    let guildsData = client.guildsData;
    if(!guildsData[guildId]) return [];

    if(!guildsData[guildId].wars) return [];
    return guildsData[guildId].wars;
}

helper.getGuildJoinData = function (client, guildId) {
    let guildsData = client.guildsData;
    if(!guildsData[guildId]) return [];

    if(!guildsData[guildId].joined) return [];
    return Object.keys(guildsData[guildId].joined) || [];
}

helper.getChannelWar = function (client, guildId) {
    try {
        let channelWar = client.guilds.cache.get(guildId).channels.cache.find(x => x.name === warVoteChannel);
        return channelWar;
    } catch (e) {
        console.log(e);
        return null;
    }
}

helper.buildList = function(client, guildId) {
    /* array for storing pages */
    let pages = [];
    let joined = helper.getGuildJoinData(client, guildId);
    let members = client.guildsData[guildId].members;
    let maxNameLength = this.getlongestNameLength(client, guildId) + 1;
    let maxClassLength = this.getMaxClassNameLength() + 1;
    let maxLengthLevel = 'Level'.length + 4;
    let maxLengthPosition = 3;
    let listString = '``' +`${'STT'.padEnd(maxLengthPosition, ' ')} Family/${'Character'.padEnd((maxNameLength - 'Family'.length),' ')} ${'Class'.padEnd(maxClassLength, ' ')} ${'Level'.padEnd(maxLengthLevel, ' ')} AP/AWK/DP\n` + '``\n';
    if(joined == void(0) || joined.length == 0) {
        pages.push(listString);
        return pages;
    }
    let totalGS = 0;
    let totalReported = 0;
    // asign to var to prevent some exception
    
    for(let x = 0; x < joined.length; x++) {
        let id = joined[x];
        let positition = (x+1);
        let posititionString = positition + '.';
        if(!members[id]) {
            let user = client.users.cache.get(id);
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
        let member = members[id];
        let character = member.character || '???';
        let className = member.class || '???';
        let level = member.level || '??';
        level = level + '';
        listString += '``' + `${posititionString.padEnd(maxLengthPosition, ' ')} ${member.family}/${character.padEnd((maxNameLength - member.family.length),' ')} ${className.padEnd(maxClassLength,' ')} ${level.padEnd(maxLengthLevel, ' ')} ${member.ap ||'??'}/${member.awk || '??'}/${member.dp ||'??'}` + '``\n';
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

helper.buildEmbed = function(client, guildId) {
    const embed = new client.Discord.MessageEmbed()
        //.setTitle("This is your title, it can hold 256 characters")
        //.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .setAuthor("Node War", "https://i.imgur.com/h9cOtT9.png")
        .setColor(0x00AE86)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("Xuan Bot", "https://i.imgur.com/h9cOtT9.png")
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("https://i.imgur.com/ZkoC0RM.png")
        .setTimestamp();

    let list = this.buildList(client, guildId);
    // set fields
    for(let i = 0; i < list.length; i++) {
        if(i == 0) {
            embed.addField("DANH SÁCH NODE WAR", list[i]);
            continue;
        }
        embed.addField("\u200B", list[i]);
    }
    embed.addField("\u200B", "\u200B");
    // add description
    if(!helper.isWarOpen(client, guildId)) {
        embed.setDescription("Hiện không có war nào!");
        return null;
    }
    let warInfo = helper.getGuildWarData(client, guildId);
    let info = `Node: ${warInfo.node || 'TBD'} - ${warInfo.war_date}\n`;
    if(warInfo.message) {
        info += `Message: ${warInfo.message || ''}`;
    }
    embed.setDescription(info);
    return embed;
}

helper.getlongestNameLength = function (client, guildId) {
    let maxLength = 'FamilyCharacter'.length;
    let joined = helper.getGuildJoinData(client, guildId);
    let members = client.guildsData[guildId].members;
    if(!joined || joined.length == 0) return 'FamilyCharacter'.length;
    for(let i in joined) {
        let id = joined[i];
        let thisLength = 0;
        // case not report gs
        if(!members[id]) {
            let user = client.users.cache.get(id);
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

helper.saveWarInfo = async function(client, guildId, warDate) {
    let warData = {
        'guild_id': guildId,
        'war_date': warDate,
        'active': 1
    }

    let result = await warModels.creatWar(guildId, warData);
    if(result) {
        client.guildsData[guildId].wars = await warModels.fetchNextWarByGuildId(guildId);
    }
}

helper.disableWar = async function(client, guildId) {
    if(warModels.disableWar(guildId)) {
        if(client.guildsData[guildId] && client.guildsData[guildId].wars) {
            let channelWar = helper.getChannelWar(client, guildId);
            if(channelWar) {
                let message = await helper.getMessage(client, guildId);
                console.log(message);
                if(message) {
                    channelWar.messages.delete(message);
                }
            }
        }
        client.guildsData[guildId].wars = {};
        client.guildsData[guildId].joined = {};
    }
    return true;
}

helper.updateWar =  async function (client, guildId, messageId = null, node = null, message = null) {
    let warData = {};
    if(!client.guildsData[guildId].wars) {
        client.guildsData[guildId].wars = {}
    }
    if(node) {
        warData.node = node;
        client.guildsData[guildId].wars.node = node;
    }

    if(messageId) {
        warData.message_id = messageId;
        client.guildsData[guildId].wars.message_id = messageId;
    }

    if(message) {
        warData.message = message;
        client.guildsData[guildId].wars.message = message;
    }

    if(!warData) return;
    await warModels.updateWar(guildId, warData);
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
helper.warAutoShutdown = async function(client, guildId) {
    let that = this;
    let warData = client.guildsData[guildId].wars;
    if(!warData) return;
    let now = new Date();
    let warDate = '';
    if(warData.war_date) warDate = warData.war_date;
    let items = warDate.split('/');
    let endWarTime = new Date(items[2], (items[1] - 1), items[0], 22);
    // war end on desire day
    if(now.getTime() >= endWarTime.getTime()) {
        await helper.disableWar(client, guildId)
        return;
    }
    setTimeout(function() {
        that.warAutoShutdown(client, guildId)
    }, recheckWarMin*10000);
}

helper.isWarOpen = function (client, guildId) {
    try {
        let guildsData = client.guildsData[guildId];
        console.log(guildsData);
        if(Object.keys(guildsData.wars).length == 0) return false;
        return true;
    } catch(e) {
        return false;
    }
}
helper.buildEmbedInfo = async function (client, guildId) {
    const embed = new client.Discord.MessageEmbed()
        //.setTitle("This is your title, it can hold 256 characters")
        //.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .setAuthor("Upcomming Node War", "https://i.imgur.com/h9cOtT9.png")
        .setColor(0x00AE86)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("Xuan Bot", "https://i.imgur.com/h9cOtT9.png")
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("https://i.imgur.com/ZkoC0RM.png")
        .setTimestamp();

    let warInfo = client.guildsData[guildId].wars;
    console.log(warInfo);
    let info = `Node: ${warInfo.node || 'TBD'} \nTime: ${warInfo.war_date}\n`;
    if(client.war.message) {
        info += `Message: ${warInfo.message || ''}`;
    }
    embed.setDescription(info);
    embed.addField("\u200B", "\u200B");
    return embed;
}

helper.isJoined = function (client, message) {
    let guildId = message.guild.id;
    let joined = helper.getGuildJoinData(client, guildId);
    if(joined.length == 0) return false;
    let memberId = message.author.id;
    console.log(memberId);
    console.log(joined);
    if(joined.indexOf(memberId) != -1) {
        return true;
    }

    return false;
}

helper.userJoining = async function(client, guildId, memberId) {
    let warData = helper.getGuildWarData(client, guildId);
    if(!warData || !warData._id) return false;
    let warId = warData._id;
    let data = {
        'guild_id': guildId,
        'war_id': warId,
        'member_id': memberId
    }

    let result = await joinModels.insert(data);
    if(result) {
        client.guildsData[guildId].joined = await joinModels.fetchByGuildId(guildId, warId);
    }
}

helper.userUnjoin = async function(client, guildId, memberId) {
    let warData = helper.getGuildWarData(client, guildId);
    if(!warData || !warData._id) return false;
    let warId = warData._id;
    let query = {
        'guild_id': guildId,
        'war_id': warId,
        'member_id': memberId
    }

    let result = await joinModels.delete(query);
    if(result) {
        client.guildsData[guildId].joined = await warModels.fetchByGuildId(guildId, warId);
    }
}

module.exports = helper;