const Discord = require('discord.js');
const config = require("../config/config.json");
const helper = require("../helper/war.js");
const warModels = require("../core/mongo/wars.js");
const joinModels = require("../core/mongo/war_participates.js");

/* Greeting member when they join our guild */
const warVoteChannel = 'war-attendance';

// time wait to delete message
const deleteMessageTime = { timeout: 3000 };

// joined member 
var joined = {};
let channelObject = null;

module.exports = async function(client){
    // get channel
	loadWar(client);

    client.on('message', async message => {
    	if(message.channel.name != warVoteChannel) return;
    	if(message.author.bot) return;
    	// if in war time return or war is not activated
        let now = Date.now();
        if(helper.isWarOpen(client, message.guild.id) == false) {
            message.reply('Not in vote time!').then(msg => {
                msg.delete(deleteMessageTime)
            }).catch(e => {console.log(e)});
        	message.delete(deleteMessageTime);
        	return;
        }
        // if message content not match join
        if(message.content.toLowerCase().indexOf('join') != 0) {
            message.reply('Please type `Join!` to vote for war!').then(msg => {
                msg.delete(deleteMessageTime)
            }).catch(e => {console.log(e)});
            message.delete(deleteMessageTime);
            return;
        }

        let authorId = message.author.id;
        if(helper.isJoined(client, message)) {
            message.reply("You've already signed for the war").then(msg => {
                msg.delete(deleteMessageTime)
            }).catch(e => {console.log(e)});
            message.delete(deleteMessageTime);
            return;
        }
        message.reply('Thanks for votting!').then(msg => {
            msg.delete(deleteMessageTime)
        }).catch(e => {console.log(e)});
        message.delete(deleteMessageTime);
        // save to the file
        await helper.userJoining(client, message.guild.id, message.author.id);
        // save to file json
        await helper.reloadTopMessage(client, message.guild.id);
        return;
    });

}


function loadWar(client) {
    client.guilds.cache.forEach(async guild => {
        let guildId = guild.id;
        let result = await warModels.fetchByGuildId(guildId);
        if(!client.guildsData) {
            client.guildsData = {};
        }
        if(!client.guildsData[guildId]) {
            client.guildsData[guildId] = {
                wars: {}
            };
        }
        
        client.guildsData[guildId].wars = Object.values(result)[0];
        if(typeof client.guildsData[guildId].wars != 'undefined') {
            let warId = client.guildsData[guildId].wars._id;
            let result = await joinModels.fetchByGuildId(guildId, warId);
            if(!client.guildsData) {
                client.guildsData = {};
            }
            if(!client.guildsData[guildId]) {
                client.guildsData[guildId] = {
                    joined: {}
                };
            }
            client.guildsData[guildId].joined = result;
        }

        let message = await helper.getMessage(client, guildId);
        if(!message) {
            await helper.reloadTopMessage(client, guildId);
        }
        await helper.warAutoShutdown(client, guild.id);
    });
}

function hourToDay(hour){
    var day = new Date();
    h = parseInt(hour.split(':')[0]);
    m = parseInt(hour.split(':')[1]);
    day.setHours(h);
    day.setMinutes(m);
    return day;
}

function dayString(nextDay = false) {
    let date = new Date();
    if(nextDay) {
        date.setDate(date.getDate()+1);
    }
    return `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`;
}