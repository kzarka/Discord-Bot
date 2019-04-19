const Discord = require('discord.js');
const config = require("../config/config.json");
const helper = require("../helper/war.js");

const membersModel = require("../core/sqllite/members.js");

const datDir = '/data/dependencies/war';
/* Greeting member when they join our guild */
const warVoteChannel = 'war-attendance';

// time wait to delete message
const deleteMessageTime = 3000;

var warInfo = null;
try {
	warInfo =  require(`..${datDir}/war.json`);
} catch (e) {
	console.log('Its first start obviously');
}

// joined member 
var joined = {};
let channelObject = null;
module.exports = async function(client){
    // get channel
    try {
        channelObject = client.channels.find(x => x.name === warVoteChannel);
    } catch(e) {
        console.log(e)
    }
    //membersModel.init();
    let mem = await membersModel.loadAll();
    client.members = mem//memberLists;

	loadWar(client, warInfo);
    let embed = buildEmbed(client);
    if(channelObject) {
        channelObject.fetchMessages().then(messages => {
            channelObject.bulkDelete(messages);
        }).catch(err => {
            console.log('Error while delete messages');
            console.log(err);
        });
        channelObject.send({embed});
    }


    client.on('message', async message => {
    	if(message.channel.name != warVoteChannel) return;
    	if(message.author.bot) return;
    	// if in war time return or war is not activated
        let now = Date.now();
        if(helper.inWarTime() || client.war.war == false) {
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
        if(!client.war.joined) client.war.joined = [];
        if(client.war.joined.indexOf(authorId) >= 0) {
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
        client.war.joined.push(authorId);
        // save to file json
        helper.saveWarInfo(client, datDir);
        helper.reloadTopMessage(channelObject, client);
        return;
    });

}


function loadWar(client, war) {
    if(war == void(0) || !helper.validDate(war.date)) {
        helper.saveWarInfo(client, datDir);
        return false;
    };
    if(war.war == void(0) || war.war == false) return false;
    client.war = war;
    return true;
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

function buildEmbed(client) {
    const embed = new Discord.RichEmbed()
        //.setTitle("This is your title, it can hold 256 characters")
        //.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
        .setAuthor("Node War", "https://i.imgur.com/h9cOtT9.png")
        .setColor(0x00AE86)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("Xuan Bot", "https://i.imgur.com/h9cOtT9.png")
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("https://i.imgur.com/ZkoC0RM.png")
        .setTimestamp();

    let list = helper.buildList(client);
    embed.addField("DANH SÁCH NODE WAR", list)
        .addBlankField(true)
    if(!client.war.war) {
        embed.setDescription("Hiện không có war nào!");
        return embed;
    }
    let info = helper.buildDescription(client);
    embed.setDescription(info);
    return embed;
}
