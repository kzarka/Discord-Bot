const Discord = require('discord.js');
const config = require("../config/config.json");

const datDir = '/data/dependencies/war';
/* Greeting member when they join our guild */
const warVoteChannel = 'war-attendance';
const warStart = '20:00'
const warEnd = '22:00'

var memberLists = null;
try {
	memberLists =  require(`..${datDir}/members.json`);
} catch (e) {
	console.log('Its first start obviously');
}


var warInfo = null;
try {
	memberJoin =  require(`..${datDir}/war.json`);
} catch (e) {
	console.log('Its first start obviously');
}
// define war stats
var war = {
	"members": memberLists,
	"info": warInfo
}
var inwar = false;
module.exports = function(client){

	if(warInfo != void(0)) {

	}
	client.on('ready', () => {
        // Hook that var to client, hope i can get it later
        client.war = war;
    });

    client.on('message', async message => {
    	if(message.channel.name != warVoteChannel) return;
    	if(message.author.bot) return;
    	// if in war time return;
        let now = Date.now();
        if(now >= hourToDay(warStart).getTime() && now <= hourToDay(warEnd).getTime()) {

        }
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