'use strict';

module.exports = {
    logInfo: function (content, message = null) {
        if (!message) {
            console.log(content);
            return;
        }
        message.channel.send(content);
    },

    isMe: function (user) {
        return (user.id == '213722448070180864');
    },

    /* Send message to all guilds in main channel */
    sendMessageToGuilds: function (message, client) {
        let guilds = client.guilds.cache;
        if(!guilds) return;
        var that = this;
        guilds.each(function (guild) {
            let channel = that.getMainChannel(client, guild);
            if(!channel) return;
            channel.send(message).catch(console.error);
        });
    },

    /* Send message to all guilds in main channel */
    setGuildsTopic: function (message, client) {
        let guilds = client.guilds.cache;
        if(!guilds) return;
        var that = this;
        guilds.each(function (guild) {
            let channel = that.getMainChannel(client, guild);
            if(!channel) return;
            channel.setTopic(message).catch(console.error);
        });
    },

    /* Send a help message */
    sendHelpMessage(message, content, cover = false) {
        if(cover) {
            content = this.wrap(content);
        }
        message.channel.send(content);
    },
    /* Create main config */
    createMainConfig: function(fs) {
        var json = {
            "bot": {
                "token": "",
                "prefix": ""
            },
            "autoload": []
        };
        json = JSON.stringify(json, null, 4);
        fs.writeFileSync('./config.json', json, 'utf8', 'w', (err) => {
            if (!err) {
                console.log('Configuration file created successfully!');
            }
        });
        console.log("Create");
    },

    /* Save an configuration file. :) */
    saveMainConfig: function(fs, json) {
        json = JSON.stringify(json, null, 4);
        fs.writeFile('./config.json', json, (err) => {
            if (!err) {
                console.log('Configuration file saved successfully!');
            }
        });
    },

    /* Create loaded module config */
    saveCommandConfig: function(fs, client) {
        let json = {};
        client.commands.keyArray().forEach(function(cmd) {
            let module = client.commands.get(cmd);
            json[cmd] = module;

        });
        json = JSON.stringify(json, null, 4);
        fs.writeFileSync('./config/commands.json', json, 'utf8', 'w', (err) => {
            if (!err) {
                console.log('Configuration file created successfully!');
            }
        });
    },

    saveModuleConfig: function(fs, client) {
        let json = {};
        Array.from(client.modules.keys()).forEach(function(module) {
            json[module] = true;

        });
        json = JSON.stringify(json, null, 4);
        fs.writeFileSync('./config/modules.json', json, 'utf8', 'w', (err) => {
            if (!err) {
                console.log('Configuration file created successfully!');
            }
        });
    },

    saveConfig: function(fs, client) {
        this.saveCommandConfig(fs, client);
        this.saveModuleConfig(fs, client);
    },

    isNormalInteger: function(str) {
        let n = Math.floor(Number(str));
        return n !== Infinity && n >= 0;
    },
    /*
     * Wrap text in a code block and escape grave characters.
     * 
     * @param {string} text - The input text.
     * @returns {string} - The wrapped text.
     */
    wrap: function(text) {
        return '```\n' + text.replace(/`/g, '`' + String.fromCharCode(8203)) + '\n```';
    },

    getMainChannel: function(client, guild) {
        let guildData = client.guildsData[guild.id];
        let channel = null;
        if(guildData && guildData['main_channel']) {
            channel = guild.channels.cache.get(guildData['main_channel']);
        } else {
            channel = guild.channels.cache.find(ch => ch.name === 'general' || ch.name === 'chat' || ch.name === 'guild-chat'|| ch.name === 'chat-guild');
        }
        return channel;
    },

    getGuestChannel: function(client, guild) {
        let guildData = client.guildsData[guild.id];
        let channel = null;
        if(guildData && guildData['welcome_channel']) {
            channel = guild.channels.cache.find(ch => ch.id == guildData['welcome_channel']);
        } else {
            channel = guild.channels.cache.find(ch => ch.name === 'guests');
        }
        return channel;
    },

    canManage: function(message) {
        let author = message.member;
        return author.hasPermission('ADMINISTRATOR') || 
            author.hasPermission('MANAGE_CHANNELS') || 
            author.hasPermission('MANAGE_GUILD') || this.isMe(author);
    }
};