'use strict';

var helper = {
    description: "War helper"
}

helper.reAsignRole = async function(message, roleName) {
    let roleToKeep = ['VIP', 'Filthy Outsider', 'Carrying Fury Scrubs', 'Guest', 'Ng0k', '( ͡° ͜ʖ ͡°)'];
    let roles = message.member.roles;
    // first remove old role
    let isOfficer = roles.cache.some(role => role.name === 'Officer');
    if(!isOfficer) {
        roles = roles.cache.filter(function(role) {
            if(!roleToKeep) return true;
            if(roleToKeep.constructor !== Array) {
                return role.name !== roleToKeep;
            }
            let result = true;
            for(let i in roleToKeep) {
                if(role.name == roleToKeep[i]){
                    result = false;
                }
            }
            return result;
        });
        await message.member.roles.remove(roles).catch(err => {
            console.log(err);
        });
    }

    /* Now add role to member */
    let role = message.guild.roles.cache.find(r => r.name === roleName);
    if(!role) return;
    if(!message.member.roles.cache.has(role.id)) {
        await message.member.roles.add(role).catch((e) => {
            console.log(e);
        });
    }
}

module.exports = helper;