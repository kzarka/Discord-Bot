const Discord = require('discord.js');
const config = require("../config/config.json");
const axios = require("axios");

const RAINBOW_ROLE = 'Rainbow';

module.exports = function(client){
      changeRoleColor(client);
}

function changeRoleColor(client) {
      client.guilds.cache.forEach(async guild => {
            let role = guild.roles.cache.find(role => role.name === RAINBOW_ROLE);
            if(!role) return;
            var color = Math.floor(Math.random()*16777215).toString(16);
            role.setColor(color).catch(console.error);
      });

      setTimeout(changeRoleColor, 120000, client);
}