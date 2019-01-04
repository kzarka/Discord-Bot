const Discord = require("discord.js");
const client = new Discord.Client();
const Enmap = require("enmap");

const core = require('./core/core');
const config = require("./config/config.json");
client.modules = new Enmap();

client.on("ready", () => {
	console.log("Black Spirit BOT");
	console.log("Starting...");
	core.loadAll(client);
  	
});
 
client.on("message", (message) => {
	console.log(client.modules);
	if (message.author.bot) return;
  	if (message.content.indexOf(config.prefix) !== 0) return;
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	core.bootstrap(client, message, args);
  	const command = args.shift().toLowerCase();

  	const cmd = client.modules.get('play');

});
 
client.login(config.token);