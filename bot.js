const Discord = require("discord.js");
const client = new Discord.Client();
const Enmap = require("enmap");

const core = require('./core/core');
const config = require("./config/config.json");
client.modules = new Enmap();
client.commands = new Enmap();

client.on("ready", () => {
	console.log("Black Spirit BOT");
	console.log("Starting...");
	core.loadAll(client);

});
 
client.on("message", (message) => {
	if (message.author.bot) return;
  	if (message.content.indexOf(config.prefix) !== 0) return;
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	core.bootstrap(client, message, args);
	let copyArgs = args.slice();
  	const command = args.shift().toLowerCase();

  	let module = client.commands.get(command);
  	if(!module) return;
  	const cmd = client.modules.get(module)[command];
  	if (typeof cmd !== 'function') return;
  	copyArgs = copyArgs.unshift(command);
  	cmd(client, message, copyArgs)
});
 
client.login(config.token);